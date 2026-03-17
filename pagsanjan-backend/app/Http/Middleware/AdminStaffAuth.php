<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminStaffAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated and is admin/staff
        if (!$request->user() || !in_array($request->user()->role, ['admin', 'staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin/Staff access required.'
            ], 403);
        }

        return $next($request);
    }
}