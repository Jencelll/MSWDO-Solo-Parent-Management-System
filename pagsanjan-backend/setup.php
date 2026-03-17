#!/usr/bin/env php
<?php

echo "========================================\n";
echo "Pagsanjan Solo Parent System - Backend Setup\n";
echo "========================================\n\n";

$baseDir = __DIR__;
$steps = [
    'Installing Composer dependencies...' => 'composer install',
    'Generating app key...' => 'php artisan key:generate',
    'Creating database and running migrations...' => 'php artisan migrate:fresh --seed',
    'Publishing Sanctum assets...' => 'php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"',
];

foreach ($steps as $message => $command) {
    echo "► $message\n";
    $output = shell_exec("cd $baseDir && $command 2>&1");
    echo trim($output) . "\n\n";
}

echo "========================================\n";
echo "✓ Setup Complete!\n";
echo "========================================\n\n";
echo "To start the development server, run:\n";
echo "  php artisan serve\n\n";
echo "API URL: http://localhost:8000\n";
echo "Sample Admin: admin / password\n";
?>
