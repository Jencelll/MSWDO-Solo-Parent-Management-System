<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Application;
use App\Models\Applicant;
use App\Http\Controllers\ApplicationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

echo "--- Testing Application Approval ---\n";

// 1. Login as Admin
$admin = User::where('role', 'admin')->first();
if (!$admin) {
    // Create a dummy admin if none exists
    $admin = User::create([
        'username' => 'testadmin',
        'full_name' => 'Test Admin',
        'email' => 'testadmin@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
        'status' => 'active'
    ]);
}
Auth::login($admin);
echo "Logged in as: " . $admin->full_name . " (ID: " . $admin->id . ")\n";

// 2. Create a Test Application
$applicant = Applicant::create([
    'first_name' => 'Test',
    'last_name' => 'Applicant',
    'dob' => '1990-01-01',
    'sex' => 'Male',
    'address' => 'Test Address',
    'barangay' => 'Poblacion Uno',
    'contact_number' => '09123456789',
    'email_address' => 'test@example.com',
]);

$application = Application::create([
    'applicant_id' => $applicant->id,
    'case_number' => 'TEST-' . time(),
    'status' => 'Pending',
    'date_applied' => now(),
    'created_by' => $admin->id,
]);

echo "Created Application ID: " . $application->id . " with status: " . $application->status . "\n";

// 3. Call Approve Method
$controller = new ApplicationController();
$request = Request::create('/api/applications/' . $application->id . '/approve', 'POST', [
    'category_code' => 'a1',
    'benefit_code' => 'A'
]);

try {
    echo "Attempting to approve...\n";
    $response = $controller->approve($request, $application->id);
    
    // Refresh application
    $application->refresh();
    echo "New Status: " . $application->status . "\n";
    
    if ($application->status === 'Approved') {
        echo " [PASS] Application approved successfully.\n";
    } else {
        echo " [FAIL] Application status is " . $application->status . "\n";
    }
    
    // Check logs
    $log = $application->statusLogs()->latest()->first();
    if ($log && $log->status_to === 'Approved') {
        echo " [PASS] Status log created.\n";
    } else {
        echo " [FAIL] Status log missing or incorrect.\n";
    }

} catch (\Exception $e) {
    echo " [ERROR] Exception: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}

// 4. Test Disapprove
$application->update(['status' => 'Pending']); // Reset
echo "\n--- Testing Disapproval ---\n";

$requestDisapprove = Request::create('/api/applications/' . $application->id . '/disapprove', 'POST', [
    'remarks' => 'Test Disapproval'
]);

try {
    echo "Attempting to disapprove...\n";
    $response = $controller->disapprove($requestDisapprove, $application->id);
    
    $application->refresh();
    echo "New Status: " . $application->status . "\n";
    
    if ($application->status === 'Disapproved') {
        echo " [PASS] Application disapproved successfully.\n";
    } else {
        echo " [FAIL] Application status is " . $application->status . "\n";
    }

} catch (\Exception $e) {
    echo " [ERROR] Exception: " . $e->getMessage() . "\n";
}

// Cleanup
$application->delete();
$applicant->delete();
// $admin->delete(); // Keep admin
