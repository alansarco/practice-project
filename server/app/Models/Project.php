<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Election extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = "elections";

    protected $fillable = [
        'projectid',
        'title',
        'description',
        'picture',
        'budget',
        'status',
        'created_by'
    ];
}
