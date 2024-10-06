<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\App_Info;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Exception;

class UserController extends Controller
{
    //Admin changing students pasword
    public function changepass(Request $request) {
        $authUser = Auth::user();

        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }
        
        $verify_code = App_Info::select("security_code")->first();

        if($verify_code->security_code != $request->security_code) {
            return response()->json([
                'message' => 'Sorry, the security code provided is invalid!'
            ]);
        }

        $validator = Validator::make($request->all(), [
            'security_code' => 'required',
            'newpass' => 'required',
            'confirmpass' => 'required',
        ]);

        $pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/';
        if(!preg_match($pattern, $request->newpass)) {
            return response()->json([
                'message' => 'Password must contain capital and small letter, number, and special character!'
            ]);    
        }

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()
            ]);
        }
        
        else {
            $user = User::where('username', $request->username)->first();
            if($user) {
                try {
                    if($request->newpass !== $request->confirmpass) {
                        return response()->json([
                            'message' => 'Password did not match!'
                        ]);        
                    }

                    $hashedPassword = Hash::make($request->newpass);
                    $update = User::where('username', $request->username)->update([ 'password' => $hashedPassword]);
                    if($update) {   
                        return response()->json([
                            'status' => 200,
                            'message' => 'Password changed!'
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
            } else {
                return response()->json([
                    'message' => 'This resident has no active account, Go to Accounts then add.'
                ]);
            }

        }
    }

    // Change your password
    public function personalchangepass(Request $request) {
        $authUser = Auth::user();

        $pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/';
        if(!preg_match($pattern, $request->newpass)) {
            return response()->json([
                'message' => 'Password must contain capital and small letter, number, and special character!'
            ]);    
        }

        $validator = Validator::make($request->all(), [
            'newpass' => 'required',
            'confirmpass' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()
            ]);
        }
        
        else {
            $user = User::where('username', $authUser->username)->first();
            if($user) {
                try {
                    if($request->newpass !== $request->confirmpass) {
                        return response()->json([
                            'message' => 'Password did not match!'
                        ]);        
                    }
                    if($request->password === $request->confirmpass) {
                        return response()->json([
                            'message' => 'Old and new password is the same!'
                        ]);
                    }
                    $hashedPassword = Hash::make($request->newpass);
                    $update = User::where('username', $authUser->username)->update([ 'password' => $hashedPassword]);
                    if($update) {   
                        return response()->json([
                            'status' => 200,
                            'message' => 'Password changed!'
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
            } else {
                return response()->json([
                    'message' => 'Something went wrong!'
                ]);
            }

        }
    }

    public function deleteuser(Request $request) {
        $authUser = Auth::user();

        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }

        $user = User::where('username', $request->username)->first();
        if($user) {
            try {
                $delete = User::where('username', $request->username)->delete();
                if($delete) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'Standard account deleted successfully!'
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
        } else {
            return response()->json([
                'message' => 'Standard account not found!'
            ]);
        }
    }

    public function adduser(Request $request) {
        $authUser = Auth::user();

        $validator = Validator::make($request->all(), [
            'username' => 'required',
            'password' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()
            ]); 
        }

        else {
            $resident = DB::table('users')->where('username', $request->username)->first();
            if($resident) {
                $hashedPassword = Hash::make($request->newpass);
                $update = DB::table('users')->where('username', $request->username)->update([ 
                    'role' => 'RESIDENT',
                    'password' => $hashedPassword,
                    'deleted_at' => NULL,
                    'access_level' => 5,
                ]);
                if($update) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'Standard account added successfully!'
                    ], 200);
                }
                return response()->json([
                    'message' => 'Something went wrong!'
                ]);
            }
            else {
                try {
                    $add = User::create([
                        'username' => $request->username,
                        'password' => $request->password,
                        'access_level' => 5,
                        'created_by' => $authUser->username
                    ]);
        
                    if($add) {
                        return response()->json([
                            'status' => 200,
                            'message' => 'Standard account added successfully!'
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
        }
    }
}
