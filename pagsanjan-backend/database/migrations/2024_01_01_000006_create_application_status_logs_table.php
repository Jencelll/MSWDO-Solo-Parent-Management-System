<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('application_status_logs')) {
            Schema::create('application_status_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('application_id');
                $table->string('status_from', 20)->nullable();
                $table->string('status_to', 20);
                $table->unsignedBigInteger('changed_by')->nullable();
                $table->timestamp('changed_at')->useCurrent();
                $table->softDeletes();

                $table->foreign('application_id')->references('id')->on('applications')->onDelete('cascade');
                $table->foreign('changed_by')->references('id')->on('users')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('application_status_logs');
    }
};
