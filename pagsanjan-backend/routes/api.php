<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SystemLogController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/dashboard/stats', function() {
    try {
        // Real data
        if (true) {
             $stats = [
                'total_applications' => \App\Models\Application::count(),
                'pending' => \App\Models\Application::where('status', 'Pending')->count(),
                'pending_prints' => \App\Models\Application::where('status', 'Approved')->where(function($q) {
                    $q->whereNull('is_printed')->orWhere('is_printed', 0)->orWhere('is_printed', false);
                })->count(),
                'approved' => \App\Models\Application::where('status', 'Approved')->count(),
                'disapproved' => \App\Models\Application::where('status', 'Disapproved')->count(),
                'male' => DB::table('applicants')
                    ->join('applications', 'applicants.id', '=', 'applications.applicant_id')
                    ->where('applications.status', 'Approved')
                    ->where('sex', 'Male')
                    ->count(),
                'female' => DB::table('applicants')
                    ->join('applications', 'applicants.id', '=', 'applications.applicant_id')
                    ->where('applications.status', 'Approved')
                    ->where('sex', 'Female')
                    ->count(),
            ];
            return response()->json($stats);
        }
    } catch (\Exception $e) {
        // Fallback to test data if database error
        return response()->json([
            'total_applications' => 15,
            'pending' => 5,
            'approved' => 8,
            'disapproved' => 2,
        ]);
    }
});

Route::get('/applications/{id}/mark-printed', [ApplicationController::class, 'markPrinted']);

Route::get('/dashboard/overview', [DashboardController::class, 'overview']);

Route::get('/dashboard/trends', function() {
    try {
        $data = \App\Models\Application::select(
                DB::raw('DATE_FORMAT(date_applied, "%Y-%m") as month'), 
                DB::raw('count(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->limit(6)
            ->get();
        return response()->json($data);
    } catch (\Exception $e) {
        return response()->json([]);
    }
});

Route::get('/dashboard/categories', function() {
    return response()->json([
        ['category_code' => 'SOLO001', 'count' => 10],
        ['category_code' => 'SOLO002', 'count' => 5],
    ]);
});

Route::get('/dashboard/recent', function() {
    try {
        $applications = \App\Models\Application::with('applicant')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        return response()->json($applications);
    } catch (\Exception $e) {
        return response()->json([]);
    }
});

Route::get('/dashboard/barangay', function() {
    try {
        $data = \App\Models\Application::join('applicants', 'applications.applicant_id', '=', 'applicants.id')
            ->where('applications.status', 'Approved')
            ->select('applicants.barangay', DB::raw('count(*) as count'))
            ->groupBy('applicants.barangay')
            ->get();
        return response()->json($data);
    } catch (\Exception $e) {
        return response()->json([]);
    }
});

// Public endpoint - create new application
// Route::post('/applications', [ApplicationController::class, 'store']); // Moved to protected
Route::post('/applications/existing', [ApplicationController::class, 'storeExisting']);
// Public endpoint - list applications (for now, until auth is fully integrated)
Route::get('/applications', [ApplicationController::class, 'index']);
// Public endpoint - view single application
// Route::get('/applications/{id}', [ApplicationController::class, 'show'])->where('id', '[0-9]+'); // Moved to protected
// Public endpoint - update application (allow editing without auth for now)
// Route::put('/applications/{id}', [ApplicationController::class, 'update']); // Moved to protected

// Application actions (Public for now)
// Moved to protected routes
// Route::post('/applications/{id}/approve', [ApplicationController::class, 'approve'])->where('id', '[0-9]+');
// Route::post('/applications/{id}/update-qualification', [ApplicationController::class, 'updateQualification'])->where('id', '[0-9]+');
// Route::post('/applications/{id}/disapprove', [ApplicationController::class, 'disapprove'])->where('id', '[0-9]+');

// Public analytics endpoints
Route::get('/analytics/demographics', [AnalyticsController::class, 'demographics']);
Route::get('/analytics/application-stats', [AnalyticsController::class, 'applicationStats']);

// Reports
Route::get('/reports/monthly', [ReportController::class, 'generateMonthlyReport']);

// Authentication routes (public)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/unified-login', [AuthController::class, 'unifiedLogin']);

// Admin/Staff Authentication routes (public)
Route::prefix('admin')->group(function () {
    Route::post('/auth/register', [AdminAuthController::class, 'register']);
    Route::post('/auth/login', [AdminAuthController::class, 'login']);
});

// System Logs (Public for now, but should be protected)
// Moved to protected routes

// Protected authentication routes
Route::get('/debug/applications', function() {
    return \App\Models\Application::with('applicant.familyMembers', 'applicant.emergencyContacts', 'category', 'benefit')->get();
});

Route::middleware('auth:sanctum')->group(function () {
    // System Logs
    Route::get('/system-logs', [SystemLogController::class, 'index']);

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/auth/update-profile', [AuthController::class, 'updateProfile']);
    
    // Debug route for Sanctum auth
    Route::get('/debug-user', function (Request $request) {
        return response()->json([
            'user' => $request->user(),
            'token' => $request->bearerToken(),
            'token_obj' => $request->user()->currentAccessToken()
        ]);
    });
});

// Protected Admin/Staff authentication routes
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AdminAuthController::class, 'logout']);
    Route::get('/auth/user', [AdminAuthController::class, 'me']);
    Route::post('/auth/update-profile', [AdminAuthController::class, 'updateProfile']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Applications (DELETE and admin actions only)
    Route::delete('/applications/{id}', [ApplicationController::class, 'destroy']);
    
    // Get current user's application
    Route::get('/applications/my', [ApplicationController::class, 'myApplication']);

    // View single application
    Route::get('/applications/{id}', [ApplicationController::class, 'show'])->where('id', '[0-9]+');
    
    // Create new application
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::post('/applications/{id}/documents', [ApplicationController::class, 'uploadDocuments']);
    Route::post('/applicants/{id}/photo', [ApplicationController::class, 'uploadPhoto']); // Added Photo Upload
    Route::post('/applications/{id}/documents/{documentId}/verify', [ApplicationController::class, 'verifyDocument']);
    
    // Update application
    Route::put('/applications/{id}', [ApplicationController::class, 'update']);

    // Application actions (Admin only)
    Route::post('/applications/{id}/approve', [ApplicationController::class, 'approve']);
    Route::post('/applications/{id}/update-qualification', [ApplicationController::class, 'updateQualification']);
    Route::post('/applications/{id}/disapprove', [ApplicationController::class, 'disapprove']);
    Route::post('/applications/{id}/archive', [ApplicationController::class, 'archive']);

    // Applications (DELETE and admin actions only)
    Route::delete('/applications/{id}', [ApplicationController::class, 'destroy']);

    // Database Backup & Restore
    Route::get('/backups', [App\Http\Controllers\BackupController::class, 'index']);
    Route::post('/backups', [App\Http\Controllers\BackupController::class, 'create']);
    Route::post('/backups/restore', [App\Http\Controllers\BackupController::class, 'restore']);
    Route::get('/backups/download/{filename}', [App\Http\Controllers\BackupController::class, 'download']);

    // User Management
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});
