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
        // Try to drop using the name from the error log
        try {
            DB::statement("ALTER TABLE applications DROP FOREIGN KEY applications_ibfk_4");
        } catch (\Exception $e) {
            // If that fails, try the standard Laravel name or other common names
            try {
                Schema::table('applications', function (Blueprint $table) {
                    $table->dropForeign(['created_by']);
                });
            } catch (\Exception $e2) {
                // If both fail, maybe it's already gone or has a different name.
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We won't restore the constraint as it causes issues with admin creating applications
    }
};
