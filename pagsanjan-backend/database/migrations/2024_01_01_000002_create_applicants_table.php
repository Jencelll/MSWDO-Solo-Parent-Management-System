<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('applicants')) {
            Schema::create('applicants', function (Blueprint $table) {
                $table->id();
                $table->string('first_name');
                $table->string('middle_name')->nullable();
                $table->string('last_name');
                $table->date('dob');
                $table->integer('age')->nullable();
                $table->enum('sex', ['Male', 'Female', 'Other']);
                $table->string('place_of_birth')->nullable();
                $table->text('address');
                $table->string('barangay');
                $table->string('educational_attainment')->nullable();
                $table->string('occupation')->nullable();
                $table->string('company_agency')->nullable();
                $table->enum('employment_status', ['Employed', 'Self-employed', 'Not employed'])->nullable();
                $table->string('religion')->nullable();
                $table->decimal('monthly_income', 12, 2)->nullable();
                $table->string('contact_number', 20)->nullable();
                $table->string('email_address')->nullable();
                $table->boolean('is_pantawid_beneficiary')->default(false);
                $table->boolean('is_indigenous_person')->default(false);
                $table->boolean('is_lgbtq')->default(false);
                $table->text('classification_details')->nullable();
                $table->text('needs_problems')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('applicants');
    }
};
