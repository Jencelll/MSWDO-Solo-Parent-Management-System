<?php

use App\Models\User;
use App\Models\AdminStaff;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- Resetting Passwords ---\n";

// Reset Admin
$admin = AdminStaff::where('username', 'admin')->first();
if ($admin) {
    $admin->password = Hash::make('admin123');
    $admin->save();
    echo "Admin password reset to: admin123\n";
} else {
    echo "Admin user not found, creating...\n";
    AdminStaff::create([
        'username' => 'admin',
        'email' => 'admin@example.com',
        'password' => Hash::make('admin123'),
        'full_name' => 'Administrator',
        'role' => 'admin'
    ]);
    echo "Created: admin / admin123\n";
}

// Reset Test User
$user = User::where('username', 'testuser')->first();
if ($user) {
    $user->password = Hash::make('password123');
    $user->save();
    echo "Test User password reset to: password123\n";
} else {
    echo "Test user not found, creating...\n";
    User::create([
        'username' => 'testuser',
        'email' => 'testuser@example.com',
        'password' => Hash::make('password123'),
        'full_name' => 'Test User',
        'role' => 'user'
    ]);
    echo "Created: testuser / password123\n";
}
