<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Admin extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = "admins";

    protected $fillable = [
        'username',
        'name', 
        'contact', 
        'email', 
        'gender', 
        'birthdate',
        'organization',
        'created_by',
        'updated_by'
    ];
}
