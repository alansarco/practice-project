<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Docrequest extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $table = 'requests';

    protected $fillable = [
        'id',
        'requestor',
        'receipt_no',
        'purpose',
        'quantity',
        'price',
        'sales',
        'date_needed',
        'date_finished',
        'status',
        'doctype',
        'created_by'
    ];
}
