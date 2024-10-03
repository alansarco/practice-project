<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class App_Info extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = "app_info";

    protected $fillable = [
        'school_id',
        'school_name',
        'acronym',
        'subscription',
        'security_code',
        'times_subscribe',
        'logo',
        'starts_at',
        'expires_at',
        'created_by'
    ];
}
