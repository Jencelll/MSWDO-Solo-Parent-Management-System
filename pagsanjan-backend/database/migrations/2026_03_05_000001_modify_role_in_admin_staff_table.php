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
        // Change role column from enum to string to allow more roles like 'mayor'
        Schema::table('admin_staff', function (Blueprint $table) {
            $table->string('role')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to enum (might lose data if roles other than admin/staff exist)
        Schema::table('admin_staff', function (Blueprint $table) {
            // We can't easily revert to enum with data that doesn't fit, so we might just leave it or try
            // $table->enum('role', ['admin', 'staff'])->default('staff')->change();
        });
    }
};
