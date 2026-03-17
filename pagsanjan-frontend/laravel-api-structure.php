
<?php

/**
 * ROUTES (routes/api.php)
 */
/*
Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'index']);
    Route::apiResource('/applicants', ApplicantController::class);
    Route::apiResource('/applications', ApplicationController::class);
    Route::post('/applications/{id}/approve', [ApplicationController::class, 'approve']);
    Route::post('/applications/{id}/disapprove', [ApplicationController::class, 'disapprove']);
    Route::get('/reports/generate', [ReportController::class, 'generate']);
});
*/

/**
 * CONTROLLER (app/Http/Controllers/ApplicationController.php)
 */
namespace App\Http\Controllers;

use App\Models\Applicant;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\CaseNumberGenerator;

class ApplicationController extends Controller {
    
    public function store(Request $request) {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'dob' => 'required|date',
            // ... all form fields ...
        ]);

        return DB::transaction(function() use ($validated, $request) {
            $applicant = Applicant::create($validated);
            
            // Save family members
            if ($request->has('family_composition')) {
                foreach($request->family_composition as $member) {
                    $applicant->familyMembers()->create($member);
                }
            }

            // Create initial application record
            $application = Application::create([
                'applicant_id' => $applicant->id,
                'status' => 'Pending',
                'case_number' => CaseNumberGenerator::generate(),
                'created_by' => auth()->id()
            ]);

            return response()->json($application, 201);
        });
    }

    public function approve(Request $request, $id) {
        $application = Application::findOrFail($id);
        $application->update([
            'status' => 'Approved',
            'category_code' => $request->category_code,
            'benefit_code' => $request->benefit_code,
            'id_number' => 'PSG-SP-' . date('Y') . '-' . str_pad($application->id, 5, '0', STR_PAD_LEFT),
            'date_issued' => now()
        ]);

        return response()->json(['message' => 'Application approved successfully']);
    }
}

/**
 * MODEL (app/Models/Applicant.php)
 */
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Applicant extends Model {
    use SoftDeletes;

    protected $fillable = [
        'first_name', 'middle_name', 'last_name', 'dob', 'sex', 
        'place_of_birth', 'address', 'barangay', 'occupation',
        'employment_status', 'monthly_income', 'is_pantawid'
    ];

    public function familyMembers() {
        return $this->hasMany(FamilyMember::class);
    }

    public function application() {
        return $this->hasOne(Application::class);
    }
}
