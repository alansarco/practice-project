<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Admin;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    // Get all the list of admins
    public function index(Request $request) {
        try {
            $admins = User::leftJoin('admins', 'users.username', '=', 'admins.username')
                ->select('admins.username', 'admins.name', 'admins.contact', 'admins.birthdate',
                    'admins.gender', 
                    DB::raw("CONCAT(DATE_FORMAT(users.last_online, '%M %d, %Y %h:%i %p')) as last_online"),
                    DB::raw("CONCAT(DATE_FORMAT(users.created_at, '%M %d, %Y')) as admin_since"),
                )
                ->where(function ($query) use ($request) {
                    $query->where('admins.name', 'like', '%' . $request->filter . '%');
                    $query->orWhere('admins.username', 'like', '%' . $request->filter . '%');
                    })
                ->where('users.account_status', 1)
                ->orderBy('admins.name', 'ASC')
                ->orderBy('admins.username', 'ASC')
                ->paginate(5);

            if($admins->count() > 0) {
                return response()->json([
                    'admins' => $admins,
                    'message' => 'Admins retrieved!',
                ]);
            }   
            else {
                return response()->json([
                    'message' => 'No Admin Accounts found!'
                ]);
            }
        }
        catch (Exception $e) {
            return response()->json([
                'status' => 404,
                'message' => $e->getMessage()
            ], 404);
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
        ->select('admins.*', 'users.password_change', 'users.account_status as account_status', 
            DB::raw("CONCAT(DATE_FORMAT(admins.birthdate, '%M %d, %Y')) as birthday"),
            DB::raw("CONCAT(DATE_FORMAT(users.created_at, '%M %d, %Y')) as date_added"),
            DB::raw("CONCAT(DATE_FORMAT(users.last_online, '%M %d, %Y')) as last_online")
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

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'gender' => 'required',
            'contact' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()
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
                        'birthdate' => $request->birthdate,  
                        'updated_by' => Auth::user()->username,
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
        $authUser = Auth::user();
        
        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }

        $validator = Validator::make($request->all(), [ 
            'username' => 'required',
            'password' => 'required',
            'name' => 'required',
            'gender' => 'required',
            'contact' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()
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
            'created_by' => Auth::user()->username,
        ]);

        $hashedPassword = Hash::make($request->newpassword);
        if($validateUser) {
            $update = User::where('username', $request->username)
                ->update([
                'password' => $hashedPassword,
                'role' => 'ADMIN',
                'access_level' => 10,
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
                'access_level' => 10,
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

        $user = User::where('username', $request->username)->first();
        if($user) {
            try {
                $users = DB::table('users')->where('username', $request->username)->first();
                if($users) {
                    $update = DB::table('users')->where('username', $request->username)->update([ 
                        'role' => 'USER',
                        'access_level' => 10,
                    ]);
                    if($update) {
                        return response()->json([
                            'status' => 200,
                            'message' => 'Admin removed successfully!'
                        ], 200);
                    }
                    return response()->json([
                        'message' => 'Something went wrong!'
                    ]);
                }
                else {
                    return response()->json([
                        'message' => 'Admin not found!'
                    ]);
                }
            } catch (Exception $e) {
                return response()->json([
                    'message' => $e->getMessage()
                ]);
            }
        } else {
            return response()->json([
                'message' => 'Master not found!'
            ]);
        }
    }
    
}
