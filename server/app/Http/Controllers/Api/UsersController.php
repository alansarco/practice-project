<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;

class UsersController extends Controller
{
    // displays all list of users
    public function index(Request $request) {
        $users = User::leftJoin('students', 'users.username', '=', 'students.username')
        ->select('students.username', 'students.name', 'students.contact', 'students.grade', 
            'students.gender',  'users.password_change', 'users.last_online', 'students.birthdate',
            DB::raw("CONCAT(DATE_FORMAT(users.last_online, '%M %d, %Y %h:%i %p')) as last_online"),
            DB::raw("CONCAT(DATE_FORMAT(students.birthdate, '%M %d, %Y %h:%i %p')) as format_birthdate "),
        )
        ->where(function ($query) use ($request) {
            $query->where('students.name', 'like', '%' . $request->filter . '%');
            $query->orWhere('students.username', 'like', '%' . $request->filter . '%');
            })
        ->where('users.account_status', 1)
        ->orderBy('students.name', 'ASC')
        ->orderBy('students.username', 'ASC')
        ->paginate(50);

        if($users->count() > 0) {
            return response()->json([
                'status' => 200,
                'message' => 'Users retrieved!',
                'users' => $users
            ], 200);
        }
        else {
            return response()->json([
                'message' => 'No users found!',
                'users' => $users
            ]);
        }
    }

    // retrieve specific user's information
    public function retrieve(Request $request) {
        $account = User::where('username', $request->username)->first();
        $haveAccount = false;
        if($account) {
            $haveAccount = true;
        }

        $user = Student::leftJoin('users', 'students.username', '=', 'users.username')
        ->select('students.*', 'users.password_change', 'users.account_status as account_status', 
            DB::raw("CONCAT(DATE_FORMAT(students.birthdate, '%M %d, %Y')) as birthday"),
            DB::raw("CONCAT(DATE_FORMAT(users.created_at, '%M %d, %Y')) as date_added"),
            DB::raw("CONCAT(DATE_FORMAT(users.last_online, '%M %d, %Y')) as last_online")
        )
        ->where('students.username', $request->username)->first();

        if($user) {
            return response()->json([
                'status' => 200,
                'user' => $user,
                'haveAccount' => $haveAccount,
                'message' => "User data retrieved!"
            ], 200);
        }
        else {
            return response()->json([
                'user' => $user,
                'message' => "User not found!"
            ]);
        }
    }

    // update specific user's information
    public function update(Request $request) {

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'grade' => 'required',
            'section' => 'required',
            'gender' => 'required',
            'contact' => 'required',
            'modality' => 'required',
            'barangay' => 'required',
            'municipality' => 'required',
            'province' => 'required', 
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }
        else {
            $user = DB::table('students')->where('username', $request->username)->first();
            if($user) {
                try {
                    $update = Student::where('username', $request->username)
                    ->update([
                        'name' => strtoupper($request->name),
                        'grade' => $request->grade,
                        'section' => strtoupper($request->section),   
                        'track' => strtoupper($request->track),   
                        'course' => strtoupper($request->course),   
                        'gender' => $request->gender,   
                        'contact' => $request->contact,   
                        'religion' => strtoupper($request->religion),   
                        'birthdate' => $request->birthdate,   
                        'modality' => strtoupper($request->modality),   
                        'house_no' => $request->house_no,   
                        'barangay' => strtoupper($request->barangay),   
                        'municipality' => strtoupper($request->municipality),   
                        'province' => strtoupper($request->province),   
                        'father_name' => strtoupper($request->father_name),   
                        'mother_name' => strtoupper($request->mother_name),   
                        'guardian' => strtoupper($request->guardian),   
                        'guardian_rel' => strtoupper($request->guardian_rel),   
                        'contact_rel' => $request->contact_rel,
                        'updated_by' => Auth::user()->username,
                    ]);

                if($update) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'Student updated successfully!'
                    ], 200);
                }
                else {
                    return response()->json([
                        'message' => 'Something went wrong!'
                    ]);
                }
                } catch (Exception $e) {
                    return response()->json([
                        'message' => $e->getMessage()
                    ]);
                }
            }
            else {
                return response()->json([
                    'message' => 'User not found'
                ]);
            }
        }
    }

    // Delete / deactivate user
    public function delete(Request $request) {
        $authUser = Auth::user();
        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }
        
        $user = DB::table('students')->where('username', $request->username)->first();
        if($user) {
            try {
                $delete = Student::where('username', $request->username)->delete();
                User::where('username', $request->username)->delete();
                if ($delete) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'Student deleted successfully!'
                    ], 200);
                } else {
                    return response()->json([   
                        'message' => 'Something went wrong!'
                    ]);
                }
            } catch (Exception $e) {
                return response()->json([
                    'message' => $e->getMessage()
                ]);
            }
        }
        else {
            return response()->json([
                'message' => 'User not found!'
            ]);
        }
    }

    public function addstudent(Request $request) {
        $authUser = Auth::user();
        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'grade' => 'required',
            'section' => 'required',
            'gender' => 'required',
            'contact' => 'required',
            'modality' => 'required',
            'barangay' => 'required',
            'municipality' => 'required',
            'province' => 'required', 
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }

        $studentExist = Student::where('username', $request->username)->first();

        if(!$studentExist) {
            try {
                $add = Student::create([
                    'username' => $request->username,
                    'name' => strtoupper($request->name),
                    'grade' => $request->grade,
                    'section' => strtoupper($request->section),   
                    'track' => strtoupper($request->track),   
                    'course' => strtoupper($request->course),   
                    'gender' => $request->gender,   
                    'contact' => $request->contact,   
                    'religion' => strtoupper($request->religion),   
                    'birthdate' => $request->birthdate,   
                    'modality' => strtoupper($request->modality),   
                    'house_no' => $request->house_no,   
                    'barangay' => strtoupper($request->barangay),   
                    'municipality' => strtoupper($request->municipality),   
                    'province' => strtoupper($request->province),   
                    'father_name' => strtoupper($request->father_name),   
                    'mother_name' => $request->mother_name,   
                    'guardian' => strtoupper($request->guardian),   
                    'guardian_rel' => strtoupper($request->guardian_rel),   
                    'contact_rel' => $request->contact_rel,
                    'created_by' => Auth::user()->username,
                ]);

            if($add) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Student added successfully!'
                ], 200);
            }
            else {
                return response()->json([
                    'message' => 'Something went wrong!'
                ]);
            }
            } catch (Exception $e) {
                return response()->json([
                    'message' => $e->getMessage()
                ]);
            }
        }
        else {
            return response()->json([
                'message' => 'LRN already exist!'
            ]);
        }
    }
}
