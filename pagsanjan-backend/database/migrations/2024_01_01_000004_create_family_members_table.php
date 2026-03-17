<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('family_members')) {
            Schema::create('family_members', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('applicant_id');
                $table->string('full_name');
                $table->string('relationship', 50);
                $table->date('dob')->nullable();
                $table->integer('age')->nullable();
                $table->string('civil_status', 50)->nullable();
                $table->string('educational_attainment')->nullable();
                $table->string('occupation')->nullable();
                $table->decimal('monthly_income', 12, 2)->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('applicant_id')->references('id')->on('applicants')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('family_members');
    }
};
