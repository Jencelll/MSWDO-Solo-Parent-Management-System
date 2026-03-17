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
        Schema::table('applications', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign('applications_ibfk_3'); // Drop the foreign key explicitly
            }
            $table->string('benefit_code', 255)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            // Revert changes (this might fail if there are invalid values, but for now it's fine)
             $table->string('benefit_code', 1)->nullable()->change();
             // Note: Re-adding foreign key might be complex if data is dirty
        });
    }
};
