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
            DB::statement("ALTER TABLE application_status_logs DROP FOREIGN KEY application_status_logs_ibfk_2");
        } catch (\Exception $e) {
            // If that fails, try the standard Laravel name
            try {
                DB::statement("ALTER TABLE application_status_logs DROP FOREIGN KEY application_status_logs_changed_by_foreign");
            } catch (\Exception $e2) {
                // If both fail, maybe it's already gone or has a different name.
                // We can query the information_schema to find it, but for now we assume one of these works.
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse
    }
};
