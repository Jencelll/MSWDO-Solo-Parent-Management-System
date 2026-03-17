<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FamilyMember extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'applicant_id', 'full_name', 'relationship', 'age', 'dob',
        'civil_status', 'educational_attainment', 'occupation', 'monthly_income',
        'is_pwd'
    ];

    protected $casts = [
        'dob' => 'date',
        'monthly_income' => 'decimal:2',
        'is_pwd' => 'boolean',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}
