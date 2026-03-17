<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "Starting autoload check...\n";
require 'vendor/autoload.php';
echo "Autoload success.\n";

$app = require_once 'bootstrap/app.php';
echo "App bootstrap success.\n";

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
echo "Kernel make success.\n";
