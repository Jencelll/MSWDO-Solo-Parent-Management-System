<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DebugAuth
{
    public function handle(Request $request, Closure $next)
    {
        Log::info('DebugAuth: Checking authentication', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'headers' => $request->headers->all(),
            'user' => Auth::user(),
            'guard' => Auth::getDefaultDriver(),
            'sanctum_user' => auth('sanctum')->user(),
        ]);

        return $next($request);
    }
}
