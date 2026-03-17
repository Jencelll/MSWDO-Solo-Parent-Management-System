<?php

use App\Models\User;
use App\Models\AdminStaff;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- Users (soloparent_accounts) ---\n";
$users = User::all();
foreach ($users as $user) {
    echo "ID: {$user->id}, Username: {$user->username}, Email: {$user->email}, Role: {$user->role}\n";
}

echo "\n--- Admins/Staff (admin_staff) ---\n";
$admins = AdminStaff::all();
foreach ($admins as $admin) {
    echo "ID: {$admin->id}, Username: {$admin->username}, Email: {$admin->email}, Role: {$admin->role}\n";
}

echo "\n--- Creating Test Users if empty ---\n";
if ($users->isEmpty()) {
    echo "Creating test user...\n";
    User::create([
        'username' => 'testuser',
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
        'full_name' => 'Test User',
        'role' => 'user'
    ]);
    echo "Created: testuser / password123\n";
}

if ($admins->isEmpty()) {
    echo "Creating test admin...\n";
    AdminStaff::create([
        'username' => 'admin',
        'email' => 'admin@example.com',
        'password' => Hash::make('admin123'),
        'full_name' => 'Administrator',
        'role' => 'admin'
    ]);
    echo "Created: admin / admin123\n";
}
