<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentUpload extends Model
{
    use HasFactory;

    protected $table = "students";
    protected $primaryKey = 'username';

    protected $fillable = [
        'username',
        'name', 
        'contact', 
        'email', 
        'gender', 
        'birthdate',
        'grade', 
        'section', 
        'program', 
        'track', 
        'course', 
        'religion', 
        'house_no', 
        'barangay', 
        'municipality', 
        'province', 
        'father_name', 
        'mother_name', 
        'guardian', 
        'guardian_rel', 
        'contact_rel', 
        'enrolled', 
        'year_enrolled', 
        'year_unenrolled', 
        'modality', 
        'created_by',
        'deleted_at',
        'updated_by'
    ];
}
