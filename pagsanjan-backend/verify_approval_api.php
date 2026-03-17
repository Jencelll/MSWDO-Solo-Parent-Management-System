<?php
// verify_approval.php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Application;
use App\Models\Applicant;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

echo "--- Verifying Approval/Disapproval API ---\n";

// 1. Ensure Admin User
$admin = User::where('username', 'admin')->first();
if (!$admin) {
    echo "Creating admin user...\n";
    $admin = User::create([
        'username' => 'admin',
        'email' => 'admin@example.com',
        'password' => Hash::make('pagsanjan2024'),
        'role' => 'admin',
        'full_name' => 'Administrator',
        'status' => 'active'
    ]);
}
echo "Admin user ID: {$admin->id}\n";

// 2. Ensure a Pending Application
$applicant = Applicant::firstOrCreate(
    ['first_name' => 'Test', 'last_name' => 'Applicant'],
    [
        'middle_name' => 'M',
        'dob' => '1990-01-01',
        'sex' => 'Male',
        'address' => 'Test Address',
        'barangay' => 'Poblacion I',
        'contact_number' => '09123456789'
    ]
);

$application = Application::create([
    'applicant_id' => $applicant->id,
    'case_number' => 'TEST-' . time(),
    'status' => 'Pending',
    'date_applied' => now(),
    'created_by' => $admin->id
]);
echo "Created pending application ID: {$application->id}\n";

// 3. Login via API to get token
echo "Attempting login...\n";
// Since we are running in CLI, we can simulate the request or use internal request dispatch
// But better to use Sanctum token generation directly for testing controller logic first
// OR simulate full HTTP request.
// Let's use curl to test the actual endpoint to catch middleware issues.

$baseUrl = 'http://127.0.0.1:8000'; // Assuming this is running
// We need to make sure the server is running. I see terminal 6 is running 'php artisan serve'.

// Login
$ch = curl_init("{$baseUrl}/api/auth/login");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'username' => 'admin',
    'password' => 'pagsanjan2024'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
($ch);

echo "Login Response Code: {$httpCode}\n";
$loginData = json_decode($response, true);
if (!isset($loginData['token'])) {
    echo "Login failed: " . $response . "\n";
    exit(1);
}
$token = $loginData['token'];
echo "Token received.\n";

// 4. Test Approve
echo "Testing Approve API...\n";
$ch = curl_init("{$baseUrl}/api/applications/{$application->id}/approve");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'category_code' => 'a1',
    'benefit_code' => 'A'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    "Authorization: Bearer {$token}"
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
($ch);

echo "Approve Response Code: {$httpCode}\n";
echo "Approve Response: {$response}\n";

if ($httpCode !== 200) {
    echo "Approval failed.\n";
} else {
    echo "Approval success.\n";
}

// Check database status
$application->refresh();
echo "Application status in DB: {$application->status}\n";

// 5. Test Disapprove (on a new application)
$application2 = Application::create([
    'applicant_id' => $applicant->id,
    'case_number' => 'TEST-2-' . time(),
    'status' => 'Pending',
    'date_applied' => now(),
    'created_by' => $admin->id
]);
echo "Created 2nd pending application ID: {$application2->id}\n";

echo "Testing Disapprove API...\n";
$ch = curl_init("{$baseUrl}/api/applications/{$application2->id}/disapprove");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'remarks' => 'Test disapproval'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    "Authorization: Bearer {$token}"
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
($ch);

echo "Disapprove Response Code: {$httpCode}\n";
echo "Disapprove Response: {$response}\n";

$application2->refresh();
echo "Application 2 status in DB: {$application2->status}\n";

// Cleanup
$application->delete();
$application2->delete();
// We don't delete applicant or admin to keep data for other tests
