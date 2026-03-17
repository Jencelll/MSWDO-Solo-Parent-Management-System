<?php

namespace App\Http\Controllers;

use App\Models\AdminStaff;
use App\Models\User;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AdminAuthController extends Controller
{
    /**
     * Register a new admin/staff user
     */
    public function register(Request $request)
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'full_name' => 'required|string|max:100',
                'email' => 'required|string|max:100|unique:admin_staff',
                'username' => 'required|string|max:50|unique:admin_staff',
                'password' => 'required|string|min:6|confirmed',
                'role' => 'required|in:admin,staff',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create the admin/staff user
            $admin = AdminStaff::create([
                'full_name' => $request->full_name,
                'email' => $request->email,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ]);

            // Create token for immediate login
            $token = $admin->createToken('auth_token')->plainTextToken;

            // Log registration
            SystemLog::create([
                'user_id' => $admin->id,
                'user_type' => 'admin_staff',
                'action' => 'admin_registered',
                'description' => 'New ' . $request->role . ' registered: ' . $request->username,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Admin/Staff registered successfully',
                'user' => $admin,
                'token' => $token,
                'token_type' => 'Bearer'
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
     * Login admin/staff
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string',
                'password' => 'required|string',
            ]);

            // Try to find the user by username or email
            $admin = AdminStaff::where('username', $request->username)
                ->orWhere('email', $request->username)
                ->first();

            if (!$admin || !Hash::check($request->password, $admin->password)) {
                if ($admin) {
                     return response()->json([
                        'success' => false,
                        'message' => 'Incorrect password'
                    ], 401);
                }

                // Check if user exists (wrong role)
                $userExists = User::where('username', $request->username)
                    ->orWhere('email', $request->username)
                    ->exists();

                if ($userExists) {
                    return response()->json([
                        'success' => false,
                        'message' => 'This account is a regular User account. Please switch to the "User" tab.'
                    ], 401);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Account not found'
                ], 401);
            }

            // Update last login
            $admin->update(['last_login' => now()]);

            // Create token
            $token = $admin->createToken('auth_token')->plainTextToken;

            // Log successful login
            SystemLog::create([
                'user_id' => $admin->id,
                'user_type' => 'admin_staff',
                'action' => 'admin_login',
                'description' => 'Admin/Staff login successful',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => $admin,
                'token' => $token,
                'token_type' => 'Bearer'
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
     * Get authenticated admin/staff user
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ]);
    }

    /**
     * Logout admin/staff
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();
            
            // Log logout
            SystemLog::create([
                'user_id' => $user->id,
                'user_type' => 'admin_staff',
                'action' => 'admin_logout',
                'description' => 'Admin/Staff logout',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Revoke token
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out'
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
     * Update admin/staff profile
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            // Determine validation rules based on what fields are being updated
            $rules = [
                'full_name' => 'nullable|string|max:100',
                'avatar' => 'nullable|image|max:2048',
            ];

            // If email is being updated, add current password requirement and email validation
            if ($request->has('email') && $request->email !== $user->email) {
                $rules['current_password'] = 'required|string';
                $rules['email'] = 'nullable|string|unique:admin_staff,email,' . $user->id;
            }

            // If new password is being updated, add current password requirement and confirmation
            if ($request->has('new_password')) {
                $rules['current_password'] = 'required|string';
                $rules['new_password'] = 'nullable|string|min:6|confirmed';
            }

            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verify current password if required
            if ($request->has('current_password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Current password is incorrect'
                    ], 422);
                }
            }

            // Prepare update data
            $updateData = [];
            
            if ($request->has('full_name')) {
                $updateData['full_name'] = $request->full_name;
            }
            
            if ($request->has('email') && $request->email !== $user->email) {
                $updateData['email'] = $request->email;
            }
            
            if ($request->has('new_password')) {
                $updateData['password'] = Hash::make($request->new_password);
            }

            // Handle avatar upload
            if ($request->hasFile('avatar')) {
                // Delete old avatar if exists
                if ($user->avatar) {
                    Storage::disk('public')->delete($user->avatar);
                }
                
                $avatarPath = $request->file('avatar')->store('avatars/admin_staff', 'public');
                $updateData['avatar'] = $avatarPath;
            }

            // Update user
            if (!empty($updateData)) {
                $user->update($updateData);
            }

            // Log profile update
            SystemLog::create([
                'user_id' => $user->id,
                'user_type' => 'admin_staff',
                'action' => 'admin_profile_updated',
                'description' => 'Admin/Staff profile updated',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => $user->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Profile update failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}