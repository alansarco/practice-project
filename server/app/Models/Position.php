<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Position extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = "positions";

    protected $fillable = [
        'positionid',
        'pollid',
        'position_name',
        'created_by', 
        'updated_by'
    ];
}
