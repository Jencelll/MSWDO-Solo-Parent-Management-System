<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\Relation;

class SystemLog extends Model
{
    protected $fillable = [
        'user_id',
        'user_type',
        'action',
        'description',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        Relation::morphMap([
            'admin_staff' => 'App\Models\AdminStaff',
            'user' => 'App\Models\User',
        ]);
    }

    public function user(): MorphTo
    {
        return $this->morphTo();
    }
}