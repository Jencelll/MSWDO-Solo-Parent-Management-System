<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Application;
use App\Models\Applicant;
use Illuminate\Support\Facades\Hash;

echo "--- Testing HTTP Application Approval ---\n";

// 1. Setup Admin User and Token
$email = 'http_admin@example.com';
$admin = User::where('email', $email)->first();
if (!$admin) {
    $admin = User::create([
        'username' => 'http_admin',
        'full_name' => 'HTTP Admin',
        'email' => $email,
        'password' => Hash::make('password'),
        'role' => 'admin',
        'status' => 'active'
    ]);
}
// Generate Sanctum Token
$token = $admin->createToken('test-token')->plainTextToken;
echo "Generated Token: " . substr($token, 0, 10) . "...\n";

// 2. Create a Test Application
$applicant = Applicant::create([
    'first_name' => 'Http',
    'last_name' => 'Tester',
    'dob' => '1995-01-01',
    'sex' => 'Female',
    'address' => 'Http Address',
    'barangay' => 'Sampaloc',
    'contact_number' => '09999999999',
    'email_address' => 'http@example.com',
]);

$application = Application::create([
    'applicant_id' => $applicant->id,
    'case_number' => 'HTTP-' . time(),
    'status' => 'Pending',
    'date_applied' => now(),
    'created_by' => $admin->id,
]);

echo "Created Application ID: " . $application->id . "\n";

// 3. Perform HTTP Request using Curl
$url = 'http://127.0.0.1:8000/api/applications/' . $application->id . '/approve';
$data = json_encode([
    'category_code' => 'a1',
    'benefit_code' => 'A'
]);

echo "Sending POST request to: $url\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";

if ($httpCode === 200) {
    echo " [PASS] HTTP Request successful.\n";
    
    // Verify DB
    $application->refresh();
    echo " DB Status: " . $application->status . "\n";
    if ($application->status === 'Approved') {
        echo " [PASS] Database updated correctly.\n";
    } else {
        echo " [FAIL] Database status mismatch.\n";
    }
} else {
    echo " [FAIL] HTTP Request failed.\n";
    echo " Curl Error: $curlError\n";
}

// Cleanup
$application->delete();
$applicant->delete();
// $admin->delete();
