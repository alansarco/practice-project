<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Admin;
use App\Models\App_Info;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminController extends Controller
{
    // Get all the list of admins
    public function index(Request $request) {
        $filter = $request->filter ?? '';

        $users = DB::select('CALL GET_ADMIN_USERS(?)', [$filter]);

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
                'admins' => $paginatedUsers,
                'message' => 'Admins retrieved!',
            ], 200);
        } else {
            return response()->json([
                'message' => 'No Admin Accounts found!',
                'users' => $paginatedUsers
            ]);
        }
    }

    // retrieve specific admin's information
    public function retrieve(Request $request) {
        $account = Admin::where('username', $request->username)->first();
        $haveAccount = false;
        if($account) {
            $haveAccount = true;
        }

        $user = User::leftJoin('admins', 'users.username', '=', 'admins.username')
        ->select('admins.*', 'users.password_change', 'users.account_status as account_status', 'users.access_level', 
            DB::raw("CONCAT(DATE_FORMAT(admins.birthdate, '%M %d, %Y')) as birthday"),
            DB::raw("CONCAT(DATE_FORMAT(users.created_at, '%M %d, %Y %h:%i %p')) as date_added"),
            DB::raw("CONCAT(DATE_FORMAT(users.last_online, '%M %d, %Y %h:%i %p')) as last_online"),
            DB::raw("CONCAT(DATE_FORMAT(admins.created_at, '%M %d, %Y %h:%i %p')) as created_date"),
            DB::raw("CONCAT(DATE_FORMAT(admins.updated_at, '%M %d, %Y %h:%i %p')) as updated_date"),
        )
        ->where('users.username', $request->username)->first();

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

    // update specific admin's information
    public function update(Request $request) {
        $authUser = Admin::select('name', 'username')->where('username', Auth::user()->username)->first();

        if($request->access == 999) {
            $superadmin = User::leftJoin('admins', 'users.username', '=', 'admins.username')
            ->where('role', 'ADMIN')
            ->where('access_level', 999)
            ->count();

            $superadmin_limit = App_Info::select('superadmin_limit')->first();

            $access_level = User::select('access_level')->where('username', $request->username)->first();

            $add = 0; 
            if($access_level->access_level == 999) $add = 1;
            
            if($superadmin >= $superadmin_limit->superadmin_limit + $add) {
                return response()->json([
                    'message' => 'Maximum Super Admin reached!'
                ]);
            }
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'gender' => 'required',
            'access' => 'required',
            'email' => 'email',
            'contact' => 'required',
            'organization' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }
        else {
            $user = DB::table('admins')->where('username', $request->username)->first();
            if($user) {
                try {
                    $update = Admin::where('username', $request->username)
                    ->update([
                        'name' => strtoupper($request->name),
                        'gender' => $request->gender,   
                        'contact' => $request->contact, 
                        'email' => $request->email,  
                        'birthdate' => $request->birthdate,  
                        'organization' => $request->organization,  
                        'updated_by' => $authUser->name,
                    ]);
                    User::where('username', $request->username)
                    ->update([
                        'access_level' => $request->access,   
                    ]);

                if($update) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'Admin updated successfully!'
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
                    'message' => 'Admin not found!'
                ]);
            }
        }
    }

    public function addadmin(Request $request) {
        $authUser = Admin::select('name')->where('username', Auth::user()->username)->first();

        if($request->access == 999) {
            $superadmin = User::leftJoin('admins', 'users.username', '=', 'admins.username')
            ->where('role', 'ADMIN')
            ->where('access_level', 999)
            ->count();
            $superadmin_limit = App_Info::select('superadmin_limit')->first();
            if($superadmin >= $superadmin_limit->superadmin_limit) {
                return response()->json([
                    'message' => 'Maximum Super Admin reached!'
                ]);
            }
        }
        
        if(Auth::user()->role !== "ADMIN" || Auth::user()->role < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }

        $validator = Validator::make($request->all(), [ 
            'username' => 'required',
            'password' => 'required',
            'name' => 'required',
            'gender' => 'required',
            'email' => 'required',
            'access' => 'required',
            'contact' => 'required',
            'organization' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }
        
        $validateUser = User::where('username', $request->username)->first();
        $validateAdmin = Admin::where('username', $request->username)->first();

        if($validateAdmin) {
            return response()->json([
                'message' => 'Username already exist!'
            ]);
        }

        $pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/';
        if(!preg_match($pattern, $request->password)) {
            return response()->json([
                'message' => 'Password must contain capital and small letter, number, and special character!'
            ]);    
        }

        Admin::create([
            'username' => $request->username,
            'name' => strtoupper($request->name),
            'contact' => $request->contact,
            'gender' => $request->gender,
            'birthdate' => $request->birthdate,
            'email' => $request->email,
            'organization' => $request->organization,
            'created_by' => $authUser->name,
            'updated_by' => $authUser->name,
        ]);

        $hashedPassword = Hash::make($request->password);
        if($validateUser) {
            $update = User::where('username', $hashedPassword)
                ->update([
                'password' => $hashedPassword,
                'role' => 'ADMIN',
                'access_level' => $request->access,
                'account_status' => 1,
            ]);
            if($update) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Admin added successfully!'
                ], 200);
            }
        }
        else {
            $addUser = User::create([
                'username' => $request->username,
                'password' => $hashedPassword,
                'role' => 'ADMIN',
                'access_level' => $request->access,
                'account_status' => 1,
                'created_by' => Auth::user()->username,
            ]);
            if($addUser) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Admin added successfully!'
                ], 200);
            }
        }
        return response()->json([
            'message' => 'Something went wrong!'
        ]);
    }

    public function deleteadmin(Request $request) {
        $authUser = Auth::user();
        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }
        
        $user = DB::table('admins')->where('username', $request->username)->first();
        if($user) {
            try {
                $delete = Admin::where('username', $request->username)->delete();
                DB::table('users')->where('username', $request->username)->delete();
                User::where('username', $request->username)->delete();
                if ($delete) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'Admin deleted successfully!'
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
                'message' => 'Admin not found!'
            ]);
        }
    }
}
