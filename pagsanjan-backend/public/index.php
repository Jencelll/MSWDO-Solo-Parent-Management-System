<?php

declare(strict_types=1);

define('LARAVEL_START', microtime(true));

// Register the auto loader
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and get the application instance
$app = require_once __DIR__.'/../bootstrap/app.php';

// Get the HTTP kernel from the service container
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Handle the incoming request
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// Send the response back to the client
$response->send();

// Terminate the application
$kernel->terminate($request, $response);
