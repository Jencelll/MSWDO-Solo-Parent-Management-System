<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Applicant extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'first_name', 'middle_name', 'last_name', 'dob', 'age', 'sex',
        'place_of_birth', 'address', 'barangay', 'educational_attainment',
        'occupation', 'company_agency', 'employment_status', 'religion',
        'monthly_income', 'contact_number', 'email_address',
        'is_pantawid_beneficiary', 'is_indigenous_person', 'is_lgbtq',
        'classification_details', 'needs_problems',
        'house_ownership_status', 'house_condition',
        'photo_path'
    ];

    protected $casts = [
        'dob' => 'date',
        'monthly_income' => 'decimal:2',
        'is_pantawid_beneficiary' => 'boolean',
        'is_indigenous_person' => 'boolean',
        'is_lgbtq' => 'boolean',
    ];

    public function familyMembers(): HasMany
    {
        return $this->hasMany(FamilyMember::class);
    }

    public function emergencyContacts(): HasMany
    {
        return $this->hasMany(EmergencyContact::class);
    }

    public function application(): HasOne
    {
        return $this->hasOne(Application::class);
    }
}
