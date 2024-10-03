<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class SeniorController extends Controller
{
    public function index(Request $request) {
        $users = Student::leftJoin('users', 'students.username', '=', 'users.username')
        ->select('students.username', 'students.name', 'students.contact', 'students.grade', 
            'students.gender',  'users.password_change', 'users.last_online', 'students.birthdate', 
            'students.track', 'students.course',
            DB::raw("CONCAT(DATE_FORMAT(users.last_online, '%M %d, %Y %h:%i %p')) as last_online"),
            DB::raw("CONCAT(DATE_FORMAT(students.birthdate, '%M %d, %Y %h:%i %p')) as format_birthdate "),
        )
        ->where(function ($query) use ($request) {
            $query->where('students.name', 'like', '%' . $request->filter . '%');
            $query->orWhere('students.username', 'like', '%' . $request->filter . '%');
            })
        ->orderBy('students.name', 'ASC')
        ->orderBy('students.username', 'ASC');

        $request->track != '' && $users->where('students.track', $request->track);
        $request->course != '' && $users->where('students.course', $request->course);

        if ($request->grade != '') {
            $users->where('students.grade', $request->grade);
        } else {
            $users->whereIn('students.grade', [11, 12]);
        }


        // Paginate the final result
        $finalresult = $users->paginate(5);

        if($finalresult->count() > 0) {
            return response()->json([
                'status' => 200,
                'message' => 'Users retrieved!',
                'users' => $finalresult
            ], 200);
        }
        else {
            return response()->json([
                'message' => 'No users found!',
                'users' => $finalresult
            ]);
        }
    }

}
