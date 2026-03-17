<?php

namespace App\Http\Controllers;

use App\Models\AdminStaff;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = collect();
        $role = $request->role;
        
        Log::info('Fetch users request', ['role' => $role]);

        // 1. Fetch Admin/Staff
        // Skip if we are specifically looking for 'user' (regular users)
        if ($role !== 'user' && (!$role || $role === 'all' || in_array($role, ['admin', 'staff']))) {
            $query = AdminStaff::query();
            
            if ($role && $role !== 'all') {
                $query->where('role', $role);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }
            $users = $users->merge($query->orderBy('created_at', 'desc')->get());
        }

        // 2. Fetch Regular Users (Solo Parents)
        // Disabled as per request to remove users from account management
        if (false && (!$role || $role === 'all' || $role === 'user')) {
             $userQuery = \App\Models\User::query();
             
             if ($request->has('search')) {
                 $search = $request->search;
                 $userQuery->where(function($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                 });
            }
            
            $regularUsers = $userQuery->orderBy('created_at', 'desc')->get()->map(function($u) {
                $u->role = 'user'; // Ensure role is set
                return $u;
            });
            
            $users = $users->merge($regularUsers);
        }

        // Re-sort the merged collection
        $users = $users->sortByDesc('created_at')->values();

        return response()->json($users);
    }

    public function store(Request $request)
    {
        // Only admin can create users
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized action.'], 403);
        }

        try {
            Log::info('Admin/Staff creation attempt', ['request_data' => $request->all()]);
            
            $validator = Validator::make($request->all(), [
                'full_name' => 'required|string|max:100',
                'email' => 'required|string|email|max:100|unique:admin_staff',
                'username' => 'required|string|max:50|unique:admin_staff',
                'role' => 'required|string|in:admin,staff,printing_staff',
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                Log::warning('Admin/Staff validation failed', ['errors' => $validator->errors()->toArray()]);
                return response()->json(['error' => $validator->errors()->first()], 422);
            }

            $user = AdminStaff::create([
                'full_name' => $request->full_name,
                'email' => $request->email,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'status' => 'active' // Default status
            ]);

            Log::info('Admin/Staff created successfully', ['user_id' => $user->id, 'username' => $user->username]);

            // Log the action if we have an authenticated user
            if (Auth::check()) {
                SystemLog::create([
                    'user_id' => Auth::id(),
                    'user_type' => 'admin_staff',
                    'action' => 'User Created',
                    'description' => "Created new {$user->role}: {$user->username}",
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);
            }

            return response()->json(['message' => 'User created successfully', 'user' => $user], 201);

        } catch (\Exception $e) {
            Log::error('Admin/Staff creation failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to create user: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        // Only admin can update users
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized action.'], 403);
        }

        try {
            $user = AdminStaff::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'full_name' => 'required|string|max:100',
                'email' => 'required|string|email|max:100|unique:admin_staff,email,' . $id,
                'username' => 'required|string|max:50|unique:admin_staff,username,' . $id,
                'role' => 'required|string|in:admin,staff,printing_staff',
                'status' => 'required|string|in:active,inactive',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()->first()], 422);
            }

            $user->update([
                'full_name' => $request->full_name,
                'email' => $request->email,
                'username' => $request->username,
                'role' => $request->role,
                'status' => $request->status
            ]);

            if ($request->has('password') && !empty($request->password)) {
                $user->update(['password' => Hash::make($request->password)]);
            }

            SystemLog::create([
                'user_id' => Auth::id(),
                'user_type' => 'admin_staff',
                'action' => 'User Updated',
                'description' => "Updated user: {$user->username}",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json(['message' => 'User updated successfully', 'user' => $user]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update user'], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        // Only admin can delete users
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized action.'], 403);
        }

        // Validate admin password
        if (!$request->has('password') || !Hash::check($request->password, $request->user()->password)) {
            return response()->json(['error' => 'Incorrect admin password.'], 403);
        }

        try {
            $user = AdminStaff::findOrFail($id);
            
            // Prevent deleting self
            if ($user->id === Auth::id()) {
                return response()->json(['error' => 'Cannot delete your own account'], 403);
            }

            $username = $user->username;
            $user->delete();

            SystemLog::create([
                'user_id' => Auth::id(),
                'user_type' => 'admin_staff',
                'action' => 'User Deleted',
                'description' => "Deleted user: {$username}",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            return response()->json(['message' => 'User deleted successfully']);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete user'], 500);
        }
    }
}
