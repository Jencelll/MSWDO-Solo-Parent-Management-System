<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/api/applications', 'GET', ['status' => 'Approved']);
$controller = new App\Http\Controllers\ApplicationController();
$response = $controller->index($request);

echo $response->content();
