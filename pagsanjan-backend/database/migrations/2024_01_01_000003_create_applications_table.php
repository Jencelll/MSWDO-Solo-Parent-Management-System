<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('solo_parent_categories')) {
            Schema::create('solo_parent_categories', function (Blueprint $table) {
                $table->string('code', 5)->primary();
                $table->text('description');
            });
        }

        if (!Schema::hasTable('benefit_qualifications')) {
            Schema::create('benefit_qualifications', function (Blueprint $table) {
                $table->char('code', 1)->primary();
                $table->text('description');
            });
        }

        if (!Schema::hasTable('applications')) {
            Schema::create('applications', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('applicant_id');
                $table->string('case_number', 50)->unique()->nullable();
                $table->string('id_number', 50)->unique()->nullable();
                $table->enum('status', ['Pending', 'Approved', 'Disapproved'])->default('Pending');
                $table->string('category_code', 5)->nullable();
                $table->char('benefit_code', 1)->nullable();
                $table->date('date_applied')->useCurrent();
                $table->date('date_issued')->nullable();
                $table->text('remarks')->nullable();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('applicant_id')->references('id')->on('applicants')->onDelete('cascade');
                $table->foreign('category_code')->references('code')->on('solo_parent_categories');
                $table->foreign('benefit_code')->references('code')->on('benefit_qualifications');
                $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
        Schema::dropIfExists('benefit_qualifications');
        Schema::dropIfExists('solo_parent_categories');
    }
};
