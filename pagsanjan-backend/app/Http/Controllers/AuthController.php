<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AdminStaff;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'full_name' => 'required|string|max:100',
                'email' => 'required|string|max:100|unique:soloparent_accounts',
                'username' => 'required|string|max:50|unique:soloparent_accounts',
                'password' => 'required|string|min:6|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create the user
            $user = User::create([
                'full_name' => $request->full_name,
                'email' => $request->email,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'role' => 'user', // Default role for applicants
            ]);

            // Create token for immediate login
            $token = $user->createToken('auth_token')->plainTextToken;

            // Log registration
            SystemLog::create([
                'user_id' => $user->id,
                'user_type' => 'user',
                'action' => 'User Registered',
                'description' => "User {$user->username} registered successfully.",
                'ip_address' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'username' => $user->username,
                    'role' => $user->role,
                ],
                'token' => $token
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Unified Login for User, Admin, Staff, and Mayor
     */
    public function unifiedLogin(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'username' => 'required|string',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors' => $validator->errors()
                ], 422);
            }

            $loginType = filter_var($request->username, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

            // 1. Check Admin/Staff/Mayor Table first (Privileged accounts)
            $admin = AdminStaff::where($loginType, $request->username)->first();

            if ($admin && Hash::check($request->password, $admin->password)) {
                // Admin login success
                $admin->update(['last_login' => now()]);
                $token = $admin->createToken('auth_token')->plainTextToken;

                SystemLog::create([
                    'user_id' => $admin->id,
                    'user_type' => 'admin_staff',
                    'action' => 'admin_login',
                    'description' => "{$admin->role} {$admin->username} logged in (Unified).",
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => $admin, // Admin model includes role
                    'token' => $token,
                    'token_type' => 'Bearer'
                ]);
            }

            // 2. Check Regular User Table
            $user = User::where($loginType, $request->username)->first();

            if ($user && Hash::check($request->password, $user->password)) {
                // User login success
                $user->last_login = now();
                $user->save();
                $token = $user->createToken('auth_token')->plainTextToken;

                SystemLog::create([
                    'user_id' => $user->id,
                    'user_type' => 'user',
                    'action' => 'User Logged In',
                    'description' => "User {$user->username} logged in (Unified).",
                    'ip_address' => $request->ip()
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => [
                        'id' => $user->id,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'username' => $user->username,
                        'role' => 'user', // Explicitly set role for frontend
                        'avatar' => $user->avatar
                    ],
                    'token' => $token
                ]);
            }

            // 3. If neither found or password wrong
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login user (Legacy)
     */
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'username' => 'required|string',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors' => $validator->errors()
                ], 422);
            }

            $loginType = filter_var($request->username, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
            $credentials = [
                $loginType => $request->username,
                'password' => $request->password
            ];

            if (!Auth::attempt($credentials)) {
                // Check if user exists (wrong password)
                $userExists = User::where($loginType, $request->username)->exists();
                if ($userExists) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Incorrect password'
                    ], 401);
                }

                // Check if admin exists (wrong role)
                $adminExists = AdminStaff::where('username', $request->username)
                    ->orWhere('email', $request->username)
                    ->exists();

                if ($adminExists) {
                    return response()->json([
                        'success' => false,
                        'message' => 'This account is an Administrator/Staff account. Please switch to the "Admin" tab.'
                    ], 401);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Account not found'
                ], 401);
            }

            $userId = Auth::id();
            $user = User::findOrFail($userId);
            $token = $user->createToken('auth_token')->plainTextToken;

            $user->last_login = now();
            $user->save();

            // Log login
            SystemLog::create([
                'user_id' => $user->id,
                'user_type' => 'user',
                'action' => 'User Logged In',
                'description' => "User {$user->username} logged in.",
                'ip_address' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'username' => $user->username,
                    'role' => $user->role,
                ],
                'token' => $token
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();
            
            // Log logout before deleting token
            if ($user) {
                SystemLog::create([
                    'user_id' => $user->id,
                    'user_type' => 'user',
                    'action' => 'User Logged Out',
                    'description' => "User {$user->username} logged out.",
                    'ip_address' => $request->ip()
                ]);
                $user->currentAccessToken()->delete();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Logout successful'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current user
     */
    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ]);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required',
                'new_password' => 'required|string|min:6|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The provided current password does not match your password.'
                ], 400);
            }

            $user->password = Hash::make($request->new_password);
            $user->save();

            SystemLog::create([
                'user_id' => $user->id,
                'user_type' => 'user',
                'action' => 'Password Changed',
                'description' => "User {$user->username} changed their password.",
                'ip_address' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Password change failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            // Validation rules
            $rules = [
                'full_name' => 'nullable|string|max:100',
                'avatar' => 'nullable|image|max:2048',
                'current_password' => 'nullable|string',
                'email' => 'nullable|string|unique:soloparent_accounts,email,' . $user->id,
                'new_password' => 'nullable|string|min:6|confirmed',
            ];

            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updates = [];
            $isSensitiveUpdate = false;

            // Check if sensitive fields are being updated
            if ($request->filled('email') && $request->email !== $user->email) {
                $isSensitiveUpdate = true;
            }
            if ($request->filled('new_password')) {
                $isSensitiveUpdate = true;
            }

            // Require current password for sensitive updates
            if ($isSensitiveUpdate) {
                if (!$request->filled('current_password')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Current password is required for security updates.'
                    ], 422);
                }

                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Incorrect current password.'
                    ], 403);
                }

                // Apply sensitive updates
                if ($request->filled('email') && $request->email !== $user->email) {
                    $user->email = $request->email;
                    $updates[] = 'Email';
                }
                
                if ($request->filled('new_password')) {
                    $user->password = Hash::make($request->new_password);
                    $updates[] = 'Password';
                }
            }

            // Apply profile updates (non-sensitive)
            if ($request->filled('full_name') && $request->full_name !== $user->full_name) {
                $user->full_name = $request->full_name;
                $updates[] = 'Full Name';
            }

            if ($request->hasFile('avatar')) {
                // Delete old avatar if exists
                if ($user->avatar) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $path = $request->file('avatar')->store('avatars', 'public');
                $user->avatar = $path;
                $updates[] = 'Avatar';
            }

            if (empty($updates)) {
                return response()->json([
                    'success' => true,
                    'message' => 'No changes made.',
                    'user' => $user
                ]);
            }

            $user->save();

            SystemLog::create([
                'user_id' => $user->id,
                'user_type' => 'user',
                'action' => 'Profile Update',
                'description' => "User {$user->username} updated: " . implode(', ', $updates),
                'ip_address' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Update failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
