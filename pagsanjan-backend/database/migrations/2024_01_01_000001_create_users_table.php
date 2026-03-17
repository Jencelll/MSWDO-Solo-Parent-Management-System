<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('username')->unique();
                $table->string('email')->unique();
                $table->string('password');
                $table->string('full_name');
                $table->enum('role', ['admin', 'staff', 'user'])->default('user');
                $table->timestamp('last_login')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        } else {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'email')) {
                    $table->string('email')->unique()->after('username');
                }
                if (!Schema::hasColumn('users', 'updated_at')) {
                    $table->timestamp('updated_at')->nullable()->after('created_at');
                }
                // Update role column to include 'user' if needed - this might be complex in MySQL
                // For now, let's assume we can add it or it's fine.
                // To be safe, we can try to modify it using raw statement if needed, 
                // but let's stick to adding email first.
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
