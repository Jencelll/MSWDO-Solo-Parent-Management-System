<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Pagsanjan Solo Parent Information System API',
        'status' => 'ok',
        'version' => '1.0.0',
        'message' => 'Backend is running!',
        'api_endpoint' => 'http://127.0.0.1:8000/api',
        'health_check' => 'http://127.0.0.1:8000/api/health',
        'timestamp' => now(),
    ]);
});

use Illuminate\Support\Facades\Artisan;

// Dummy login route to prevent Laravel auth errors
Route::get('/login', function () {
    return response()->json(['error' => 'Unauthorized'], 401);
})->name('login');

Route::get('/migrate', function () {
    try {
        Artisan::call('migrate', ['--force' => true]);
        return response()->json(['message' => 'Migration successful', 'output' => Artisan::output()]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});
