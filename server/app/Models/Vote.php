<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vote extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = "votes";

    protected $fillable = [
        'voterid',
        'pollid', 
        'positionid', 
        'candidateid',  
        'created_by',  
        'updated_by',  
    ];
}
