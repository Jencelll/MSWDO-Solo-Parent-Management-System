<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoloParentCategory extends Model
{
    public $incrementing = false;
    public $keyType = 'string';
    protected $primaryKey = 'code';

    protected $fillable = ['code', 'description'];

    public $timestamps = false;
}
