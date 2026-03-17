<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\FamilyMember;
use App\Models\Applicant;
use App\Models\Application;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CheckDependentEligibility extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'solo:check-eligibility';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and remove over-aged dependents (23+), and update parent status if no qualified dependents remain.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting eligibility check...');

        // 1. Find dependents who are 23 or older AND NOT PWD
        // PWD dependents are exempt from age limit
        // using DOB is more accurate
        $overAgedDependents = FamilyMember::whereRaw("TIMESTAMPDIFF(YEAR, dob, CURDATE()) >= 23")
            ->where(function($query) {
                $query->where('is_pwd', false)
                      ->orWhereNull('is_pwd');
            })
            ->get();

        if ($overAgedDependents->isEmpty()) {
            $this->info('No over-aged dependents found.');
            return;
        }

        $affectedApplicantIds = $overAgedDependents->pluck('applicant_id')->unique();
        $count = $overAgedDependents->count();

        // 2. Delete them (Soft Delete) and Log notification
        foreach ($overAgedDependents as $dependent) {
            $applicant = Applicant::find($dependent->applicant_id);
            if ($applicant) {
                // Create a system notification log
                \App\Models\SystemLog::create([
                    'user_id' => 1, // System
                    'user_type' => 'admin_staff',
                    'action' => 'Dependent Aged Out',
                    'description' => "Child {$dependent->name} of {$applicant->first_name} {$applicant->last_name} has reached 23 years old and was removed.",
                    'ip_address' => '127.0.0.1'
                ]);
            }
            $dependent->delete();
        }
        
        $this->info("Removed {$count} over-aged dependent(s).");

        // 3. Check affected applicants
        foreach ($affectedApplicantIds as $applicantId) {
            $this->checkApplicantStatus($applicantId);
        }

        $this->info('Eligibility check completed.');
    }

    private function checkApplicantStatus($applicantId)
    {
        // Count remaining qualified dependents (under 23 OR PWD)
        // PWD dependents are qualified regardless of age
        // Safest is to query DOB < 23 OR is_pwd = true.
        $qualifiedDependentsCount = FamilyMember::where('applicant_id', $applicantId)
            ->where(function($query) {
                $query->whereRaw("TIMESTAMPDIFF(YEAR, dob, CURDATE()) < 23")
                      ->orWhere('is_pwd', true);
            })
            ->count();

        if ($qualifiedDependentsCount === 0) {
            // Applicant has no more qualified dependents
            $this->warn("Applicant ID {$applicantId} has no more qualified dependents.");

            // Find their Active/Approved Application
            $application = Application::where('applicant_id', $applicantId)
                ->where('status', 'Approved')
                ->first();

            if ($application) {
                // Disqualify/Expire the application
                $application->update([
                    'status' => 'Disapproved', // or 'Inactive' / 'Expired' if we had those statuses. Using Disapproved based on "not classified as solo parent"
                    'remarks' => $application->remarks . "\n[System]: Disqualified - No qualified dependents (children aged < 23) remaining.",
                    'expiration_date' => now(), // Expire immediately
                ]);
                
                // Add log
                $application->statusLogs()->create([
                    'status_from' => 'Approved',
                    'status_to' => 'Disapproved',
                    'remarks' => 'System Auto-disqualification: No qualified dependents remaining.',
                    'changed_by' => 1, // System/Admin
                ]);

                // Create System Log for Admin Notification
                \App\Models\SystemLog::create([
                    'user_id' => 1, // System
                    'user_type' => 'admin_staff',
                    'action' => 'Application Disqualified',
                    'description' => "Application for {$applicant->first_name} {$applicant->last_name} disqualified: No qualified dependents remaining.",
                    'ip_address' => '127.0.0.1'
                ]);

                $this->info("Application for Applicant ID {$applicantId} has been disqualified.");
            }
        }
    }
}
