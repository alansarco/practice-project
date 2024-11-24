<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Student;
use Illuminate\Http\Request;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class UsersController extends Controller
{
    // displays all list of users
    public function index(Request $request) {
        $filter = $request->filter ?? '';

        $users = DB::select('CALL GET_STUDENT_USERS(?)', [$filter]);

        // Convert the results into a collection
        $usersCollection = collect($users);

        // Set pagination variables
        $perPage = 50; // Number of items per page
        $currentPage = LengthAwarePaginator::resolveCurrentPage(); // Get the current page

        // Slice the collection to get the items for the current page
        $currentPageItems = $usersCollection->slice(($currentPage - 1) * $perPage, $perPage)->values();

        // Create a LengthAwarePaginator instance
        $paginatedUsers = new LengthAwarePaginator($currentPageItems, $usersCollection->count(), $perPage, $currentPage, [
            'path' => $request->url(), // Set the base URL for pagination links
            'query' => $request->query(), // Preserve query parameters in pagination links
        ]);

        // Return the response
        if ($paginatedUsers->count() > 0) {
            return response()->json([
                'status' => 200,
                'message' => 'Users retrieved!',
                'users' => $paginatedUsers
            ], 200);
        } else {
            return response()->json([
                'message' => 'No users found!',
                'users' => $paginatedUsers
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
            DB::raw("CONCAT(DATE_FORMAT(users.created_at, '%M %d, %Y %h:%i %p')) as date_added"),
            DB::raw("CONCAT(DATE_FORMAT(users.last_online, '%M %d, %Y %h:%i %p')) as last_online"),
            DB::raw("CONCAT(DATE_FORMAT(students.created_at, '%M %d, %Y %h:%i %p')) as created_date"),
            DB::raw("CONCAT(DATE_FORMAT(students.updated_at, '%M %d, %Y %h:%i %p')) as updated_date"),
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
        $authUser = Admin::select('name')->where('username', Auth::user()->username)->first();

        if(!is_numeric($request->username) || strlen($request->username) != 12) {
            return response()->json([
                'message' => 'LRN must be an exact 12 digit number!'
            ]);
        }

        $track = $request->track;
        $course = $request->course;
        $program = $request->program;
        // Validation
        if ($request->grade < 11) {
            $track = NULL;
            $course = NULL;
        }
        else if ($request->grade > 10) {
            $program = NULL;
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'grade' => 'required',
            'section' => 'required',
            'gender' => 'required',
            'contact' => 'required',
            'email' => 'required',
            'modality' => 'required',
            'barangay' => 'required',
            'municipality' => 'required',
            'province' => 'required', 
            'enrolled' => 'required', 
            'year_enrolled' => 'required', 
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }
        else {
            $currentYear = null;
            if($request->enrolled == 0) {
                $currentYear = Carbon::now()->format('Y');
            }

            $user = DB::table('students')->where('username', $request->username)->first();
            if($user) {
                try {
                    $update = Student::where('username', $request->username)
                    ->update([
                        'name' => strtoupper($request->name),
                        'grade' => $request->grade,
                        'section' => strtoupper($request->section),   
                        'program' => strtoupper($program),   
                        'track' => strtoupper($track),   
                        'course' => strtoupper($course),   
                        'gender' => $request->gender,   
                        'contact' => $request->contact,   
                        'email' => $request->email,   
                        'religion' => strtoupper($request->religion),   
                        'org_name' => strtoupper($request->org_name),   
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
                        'enrolled' => $request->enrolled,
                        'year_enrolled' => $request->year_enrolled,
                        'year_unenrolled' => $currentYear,
                        'updated_by' => $authUser->name,
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
        $currentYear = Carbon::now()->format('Y');

        $authUser = Auth::user();
        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }
        
        $user = DB::table('students')->where('username', $request->username)->first();
        if($user) {
            try {
                Student::where('username', $request->username) ->update(['year_unenrolled' => $currentYear]);
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
        $authUser = Admin::select('name')->where('username', Auth::user()->username)->first();

        if(Auth::user()->role !== "ADMIN" || Auth::user()->role < 10) {
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
            'email' => 'required',
            'modality' => 'required',
            'barangay' => 'required',
            'municipality' => 'required',
            'province' => 'required', 
            'enrolled' => 'required', 
            'year_enrolled' => 'required', 
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }

        if(!is_numeric($request->username) || strlen($request->username) != 12) {
            return response()->json([
                'message' => 'LRN must be an exact 12 digit number!'
            ]);
        }

        $track = $request->track;
        $course = $request->course;
        $program = $request->program;
        // Validation
        if ($request->grade < 11) {
            $track = NULL;
            $course = NULL;
        }
        else if ($request->grade > 10) {
            $program = NULL;
        }

        $studentExist = Student::where('username', $request->username)->first();

        if(!$studentExist) {
            try {
                $add = Student::create([
                    'username' => $request->username,
                    'name' => strtoupper($request->name),
                    'grade' => $request->grade,
                    'section' => strtoupper($request->section),   
                    'track' => strtoupper($track),   
                    'program' => strtoupper($program),   
                    'course' => strtoupper($course),   
                    'gender' => $request->gender,   
                    'contact' => $request->contact,   
                    'email' => $request->email,   
                    'org_name' => strtoupper($request->org_name),   
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
                    'enrolled' => $request->enrolled,
                    'year_enrolled' => $request->year_enrolled,
                    'year_unenrolled' => null,
                    'created_by' => $authUser->name,
                    'updated_by' => $authUser->name,
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
