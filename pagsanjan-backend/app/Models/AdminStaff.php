<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class AdminStaff extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes;

    protected $table = 'admin_staff';

    protected $fillable = [
        'username',
        'email',
        'password',
        'full_name',
        'avatar',
        'role',
        'status',
        'last_login',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login' => 'datetime',
    ];
}