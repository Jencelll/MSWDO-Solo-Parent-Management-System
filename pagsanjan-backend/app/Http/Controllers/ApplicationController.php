<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\ApplicationStatusLog;
use App\Models\SystemLog;
use App\Models\AdminStaff;
use App\Models\User;
use App\Services\CaseNumberGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    public function myApplication(Request $request)
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Find the latest application created by this user
        $application = Application::with('applicant.familyMembers', 'applicant.emergencyContacts', 'category', 'benefit', 'documents')
            ->where('created_by', $userId)
            ->latest()
            ->first();

        if (!$application) {
            return response()->json(null); // No application found
        }

        return response()->json($application);
    }

    public function verifyDocument(Request $request, $id, $documentId)
    {
        $request->validate([
            'status' => 'required|in:Verified,Rejected,Pending',
            'remarks' => 'nullable|string'
        ]);

        $application = Application::findOrFail($id);
        $document = $application->documents()->findOrFail($documentId);

        $document->update([
            'status' => $request->status,
            'remarks' => $request->remarks
        ]);

        // Log the action
        SystemLog::create([
            'user_id' => Auth::id(),
            'action' => 'Document Verification',
            'description' => "Document {$document->type} status updated to {$request->status} for application {$application->id}",
            'ip_address' => $request->ip()
        ]);

        return response()->json(['message' => 'Document status updated', 'data' => $document]);
    }

    public function index(Request $request)
    {
        $query = Application::select('applications.*')
            ->join('applicants', function($join) {
                $join->on('applications.applicant_id', '=', 'applicants.id')
                     ->whereNull('applicants.deleted_at');
            })
            ->with(['applicant.familyMembers', 'applicant.emergencyContacts', 'category', 'benefit']);

        if ($request->has('status') && $request->status) {
            $query->where('applications.status', $request->status);
        }

        if ($request->has('barangay') && $request->barangay) {
            $query->where('applicants.barangay', $request->barangay);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('applicants.first_name', 'like', "%$search%")
                    ->orWhere('applicants.last_name', 'like', "%$search%")
                    ->orWhere('applicants.contact_number', 'like', "%$search%")
                    ->orWhere('applications.case_number', 'like', "%$search%")
                    ->orWhere('applications.id_number', 'like', "%$search%");
            });
        }

        // Sort alphabetically by first name then last name
        $query->orderBy('applicants.first_name', 'asc')
              ->orderBy('applicants.last_name', 'asc');

        return response()->json($query->paginate(15));
    }

    public function storeExisting(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'sex' => 'required',
            'dob' => 'required|date',
            'barangay' => 'required',
            'category_code' => 'required',
            'benefit_code' => 'required',
            'id_number' => 'required|string',
            'date_issued' => 'required|date',
            'expiration_date' => 'required|date',
        ]);

        DB::beginTransaction();
        try {
            // Check for potential duplicate by name/dob before creating
            $existingApplicant = Applicant::where('first_name', $request->first_name)
                ->where('last_name', $request->last_name)
                ->where('dob', $request->dob)
                ->first();

            if ($existingApplicant) {
                 // Check if existing applicant has an active application
                 $existingApp = Application::where('applicant_id', $existingApplicant->id)
                    ->whereIn('status', ['Pending', 'Approved'])
                    ->first();
                 if ($existingApp) {
                     return response()->json(['message' => 'Applicant already exists with an active application.'], 400);
                 }
                 $applicant = $existingApplicant;
            } else {
                // Create Applicant
                $applicantData = $request->only([
                    'first_name', 'middle_name', 'last_name', 'dob', 'age', 'sex',
                    'place_of_birth', 'address', 'barangay', 'educational_attainment',
                    'occupation', 'company_agency', 'employment_status', 'religion',
                    'monthly_income', 'contact_number', 'email_address',
                    'is_pantawid_beneficiary', 'is_indigenous_person', 'is_lgbtq',
                    'classification_details', 'needs_problems',
                    'house_ownership_status', 'house_condition'
                ]);
                
                $applicant = Applicant::create($applicantData);

                // Create Family Members
                if ($request->has('family_members')) {
                    foreach ($request->family_members as $member) {
                        $applicant->familyMembers()->create($member);
                    }
                }

                // Create Emergency Contacts
                if ($request->has('emergency_contacts')) {
                    foreach ($request->emergency_contacts as $contact) {
                        $applicant->emergencyContacts()->create($contact);
                    }
                }
            }

            // Create Application with existing record details
            $application = Application::create([
                'applicant_id' => $applicant->id,
                'case_number' => CaseNumberGenerator::generate(), 
                'status' => 'Approved', // Existing records are presumed approved
                'date_applied' => $request->date_issued, 
                'date_issued' => $request->date_issued,
                'expiration_date' => $request->expiration_date,
                'id_number' => $request->id_number,
                'created_by' => Auth::id(),
                'category_code' => $request->category_code,
                'benefit_code' => $request->benefit_code,
                'remarks' => 'Encoded as Existing Record'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Existing record registered successfully',
                'application' => $application->load('applicant')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create application: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        if ($user && !in_array($user->role, ['admin', 'staff'])) {
            $existingApplication = Application::where('created_by', $user->id)
                ->whereIn('status', ['Pending', 'Approved'])
                ->first();

            if ($existingApplication) {
                return response()->json(['message' => 'You already have an active application.'], 400);
            }
        }

        DB::beginTransaction();
        try {
            // Create Applicant
            $applicantData = $request->only([
                'first_name', 'middle_name', 'last_name', 'dob', 'age', 'sex',
                'place_of_birth', 'address', 'barangay', 'educational_attainment',
                'occupation', 'company_agency', 'employment_status', 'religion',
                'monthly_income', 'contact_number', 'email_address',
                'is_pantawid_beneficiary', 'is_indigenous_person', 'is_lgbtq',
                'classification_details', 'needs_problems',
                'house_ownership_status', 'house_condition'
            ]);
            
            $applicant = Applicant::create($applicantData);

            // Create Family Members
            if ($request->has('family_members')) {
                foreach ($request->family_members as $member) {
                    $applicant->familyMembers()->create($member);
                }
            }

            // Create Emergency Contacts
            if ($request->has('emergency_contacts')) {
                foreach ($request->emergency_contacts as $contact) {
                    $applicant->emergencyContacts()->create($contact);
                }
            }

            // Create Application
            $application = Application::create([
                'applicant_id' => $applicant->id,
                'case_number' => CaseNumberGenerator::generate(),
                'status' => 'Pending',
                'date_applied' => now(),
                'created_by' => Auth::id(),
                'category_code' => $request->category_code,
                'benefit_code' => $request->benefit_code,
            ]);

            // Handle Documents
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $type => $file) {
                    $path = $file->store('documents/' . $application->id, 'public');
                    ApplicationDocument::create([
                        'application_id' => $application->id,
                        'type' => $type,
                        'file_path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Application submitted successfully',
                'application' => $application->load('applicant')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create application: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $application = Application::with('applicant.familyMembers', 'applicant.emergencyContacts', 'category', 'benefit', 'documents', 'statusLogs')->find($id);
        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }
        return response()->json($application);
    }

    public function update(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        $applicant = $application->applicant;

        DB::beginTransaction();
        try {
            // Update Applicant
            $applicant->update($request->only([
                'first_name', 'middle_name', 'last_name', 'dob', 'age', 'sex',
                'place_of_birth', 'address', 'barangay', 'educational_attainment',
                'occupation', 'company_agency', 'employment_status', 'religion',
                'monthly_income', 'contact_number', 'email_address',
                'is_pantawid_beneficiary', 'is_indigenous_person', 'is_lgbtq',
                'classification_details', 'needs_problems',
                'house_ownership_status', 'house_condition'
            ]));

            // Update Application
            $application->update($request->only([
                'category_code', 'benefit_code', 'remarks'
            ]));

            // Update Family Members (Simple delete and re-create for now, or update logic)
            // Ideally we should update existing ones, but for simplicity:
            if ($request->has('family_members')) {
                $applicant->familyMembers()->delete();
                foreach ($request->family_members as $member) {
                    $applicant->familyMembers()->create($member);
                }
            }

            if ($request->has('emergency_contacts')) {
                $applicant->emergencyContacts()->delete();
                foreach ($request->emergency_contacts as $contact) {
                    $applicant->emergencyContacts()->create($contact);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Application updated successfully', 'application' => $application->fresh('applicant')]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Update failed: ' . $e->getMessage()], 500);
        }
    }

    public function uploadDocuments(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        
        $request->validate([
            'documents' => 'required|array',
            'documents.*' => 'file|mimes:jpeg,png,pdf|max:10240' // 10MB
        ]);

        $uploaded = [];
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $type => $file) {
                $docType = is_string($type) ? $type : 'document';
                
                $path = $file->store('documents/' . $application->id, 'public');
                $doc = ApplicationDocument::create([
                    'application_id' => $application->id,
                    'type' => $docType,
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);
                $uploaded[] = $doc;
            }
        }

        return response()->json(['message' => 'Documents uploaded successfully', 'documents' => $uploaded]);
    }

    public function uploadPhoto(Request $request, $applicantId)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // Max 5MB
        ]);

        $applicant = Applicant::findOrFail($applicantId);
        $application = Application::where('applicant_id', $applicantId)->latest()->first();

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            // Generate secure filename
            $filename = 'applicant_' . $applicant->id . '_' . time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            
            DB::beginTransaction();
            try {
                // Store in public disk
                $path = $file->storeAs('applicant_photos', $filename, 'public');
                $photoUrl = '/storage/' . $path;

                // 1. Update applicant record (Registry Profile)
                $applicant->photo_path = $photoUrl;
                $applicant->save();

                // 2. Update application record (ID Card Details)
                if ($application) {
                    $application->photo_path = $photoUrl;
                    $application->save();
                }

                // 3. Log action
                SystemLog::create([
                    'user_id' => Auth::id(),
                    'action' => 'Photo Upload',
                    'description' => "Uploaded photo for applicant {$applicant->id} and application " . ($application ? $application->id : 'N/A'),
                    'ip_address' => $request->ip()
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Photo uploaded successfully to registry and ID card record',
                    'photo_path' => $photoUrl,
                    'applicant_id' => $applicant->id,
                    'application_id' => $application ? $application->id : null
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to save photo: ' . $e->getMessage()
                ], 500);
            }
        }

        return response()->json(['success' => false, 'message' => 'No photo uploaded'], 400);
    }

    public function updateQualification(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        
        $request->validate([
            'category_code' => 'required',
            'benefit_code' => 'required',
            'id_number' => 'required'
        ]);

        $application->update([
            'category_code' => $request->category_code,
            'benefit_code' => $request->benefit_code,
            'id_number' => $request->id_number
        ]);

        // Log the change
        SystemLog::create([
            'user_id' => Auth::id(),
            'action' => 'Update Qualification',
            'description' => "Updated qualification details for application {$application->id}",
            'ip_address' => $request->ip()
        ]);

        return response()->json(['message' => 'Qualification updated successfully', 'application' => $application]);
    }

    public function approve(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        
        $application->update([
            'status' => 'Approved',
            'category_code' => $request->category_code,
            'benefit_code' => $request->benefit_code,
            'date_issued' => now(),
            'expiration_date' => now()->addYears(1), // Default 1 year validity
            'id_number' => $request->id_number ?: ('SP-' . date('Y') . '-' . str_pad($application->id, 5, '0', STR_PAD_LEFT))
        ]);

        ApplicationStatusLog::create([
            'application_id' => $application->id,
            'status' => 'Approved',
            'remarks' => $request->remarks,
            'changed_by' => Auth::id()
        ]);

        return response()->json(['message' => 'Application approved', 'application' => $application]);
    }

    public function disapprove(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        
        $application->update(['status' => 'Disapproved']);

        ApplicationStatusLog::create([
            'application_id' => $application->id,
            'status' => 'Disapproved',
            'remarks' => $request->remarks,
            'changed_by' => Auth::id()
        ]);

        return response()->json(['message' => 'Application disapproved', 'application' => $application]);
    }

    public function archive(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        $application->delete(); // Soft delete
        return response()->json(['message' => 'Application archived']);
    }

    public function destroy($id)
    {
        $application = Application::withTrashed()->findOrFail($id);
        $application->forceDelete();
        return response()->json(['message' => 'Application permanently deleted']);
    }

    public function markPrinted($id)
    {
        $application = Application::findOrFail($id);
        
        $application->update([
            'is_printed' => true,
            'date_printed' => now()
        ]);

        SystemLog::create([
            'user_id' => Auth::id(),
            'action' => 'ID Card Printed',
            'description' => "Printed ID card for application {$application->id}",
            'ip_address' => request()->ip()
        ]);

        return response()->json(['message' => 'ID marked as printed', 'application' => $application]);
    }
}
