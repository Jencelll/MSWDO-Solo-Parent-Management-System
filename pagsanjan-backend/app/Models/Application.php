<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Application extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'applicant_id', 'case_number', 'id_number', 'status',
        'category_code', 'benefit_code', 'date_applied', 'date_issued', 'expiration_date',
        'remarks', 'created_by', 'photo_path', 'is_printed', 'date_printed'
    ];

    protected $casts = [
        'date_applied' => 'date',
        'date_issued' => 'date',
        'expiration_date' => 'date',
        'date_printed' => 'datetime',
        'is_printed' => 'boolean',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(ApplicationStatusLog::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(SoloParentCategory::class, 'category_code', 'code');
    }

    public function benefit(): BelongsTo
    {
        return $this->belongsTo(BenefitQualification::class, 'benefit_code', 'code');
    }
}
