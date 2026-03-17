<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 0. Add missing columns to admin_staff if they don't exist
        Schema::table('admin_staff', function (Blueprint $table) {
            if (!Schema::hasColumn('admin_staff', 'status')) {
                $table->string('status')->default('active')->after('role');
            }
            if (!Schema::hasColumn('admin_staff', 'avatar')) {
                $table->string('avatar')->nullable()->after('full_name');
            }
        });

        // 1. Copy admin and staff from users to admin_staff
        $adminsAndStaff = DB::table('users')
            ->whereIn('role', ['admin', 'staff'])
            ->get();

        foreach ($adminsAndStaff as $user) {
            // Check if user already exists in admin_staff to avoid duplicates
            $exists = DB::table('admin_staff')->where('email', $user->email)->exists();
            
            if (!$exists) {
                DB::table('admin_staff')->insert([
                    'full_name' => $user->full_name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'password' => $user->password,
                    'role' => $user->role,
                    'status' => $user->status ?? 'active',
                    'last_login' => $user->last_login,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]);
            }
        }

        // 2. Delete admin and staff from users
        DB::table('users')->whereIn('role', ['admin', 'staff'])->delete();

        // 3. Rename users table to soloparent_accounts
        Schema::rename('users', 'soloparent_accounts');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Rename soloparent_accounts back to users
        Schema::rename('soloparent_accounts', 'users');

        // 2. Move admin/staff back to users (optional, but good for rollback)
        $adminsAndStaff = DB::table('admin_staff')->get();

        foreach ($adminsAndStaff as $user) {
            DB::table('users')->insert([
                'full_name' => $user->full_name,
                'username' => $user->username,
                'email' => $user->email,
                'password' => $user->password,
                'role' => $user->role,
                'status' => $user->status,
                'last_login' => $user->last_login,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]);
        }
        
        // We don't delete from admin_staff in down() to be safe, 
        // or we could truncate admin_staff if we are sure.
    }
};
