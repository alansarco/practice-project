<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\AESCipher;
use App\Models\App_Info;
use Illuminate\Support\Facades\Hash;
use App\Models\Student;
use App\Models\Password;
use App\Models\Poll;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;

class LoginController extends Controller {

    protected $aes;
    public function __construct() {
        $this->aes = new AESCipher;

    }
    public function login(Request $request)  {
        $rules = [
            'username' => 'required|string',
            'password' => 'required|string',
        ];
        $credentials = $request->validate($rules);

        // $password=$this->aes->encrypt($request->password);
        $verifyUser = User::select('username', 'access_level', 'role', 'password_change')
            ->whereNull('deleted_at')
            ->where('username', $request->username)
            ->first();

        if (!Auth::attempt($credentials)) {
            //Start
            // If student is not yet registered and already exist in students table,
            // We will add them in users table but propt them to set permanent password
            if (!$verifyUser && $request->role == "USER") {
                $verifyStudent = Student::select('username', 'contact', 'enrolled')
                    ->whereNull('deleted_at')
                    ->where('username', $request->username)
                    ->where('contact', $request->password)
                    ->first();

                if($verifyStudent) {
                    if($verifyStudent->enrolled == 1) {
                        $add = User::create([
                            'username' => $verifyStudent->username,
                            'password' => $verifyStudent->contact,
                            'role' => 'USER',
                            'access_level' => 5,
                            'account_status' => '0',
                            'password_change' => '0',
                            'created_by' => $request->username
                        ]);
                        if($add) {
                            return response()->json([
                                'status' => 200,
                                'user' => $verifyStudent->username,
                                'role' => "USER",
                                'access' => 5,
                                'changepass' => true,
                                'message' => "Please set your permanent password!"
                            ], 200);
                        }
                        else {
                            return response()->json([
                                'message' => 'Something went wrong!'
                            ]);
                        }
                    }
                    else {
                        return response()->json([
                            'message' => 'It seems that you are not currently enrolled this year!'
                        ]);
                    }
                }
                return response()->json([
                    'message' => "Invalid student credentials!"
                ]);
            }
            else if ($verifyUser && $verifyUser->role == "USER") {
                return response()->json([
                    'message' => "Invalid student credentials!"
                ]);
            }
            // End
            return response()->json([
                'message' => "Invalid admin credentials!"
            ]);
        }               
        
        if($verifyUser && $verifyUser->role == "USER") {
            $checkifenrolled = Student::where('username', $request->username)->where('enrolled', '!=', 1)->first();
            if($checkifenrolled) {
                return response()->json([
                    'message' => 'It seems that you are not currently enrolled this year!'  
                ]);
            }
        }
        
        
            
        if ($verifyUser && $verifyUser->password_change == 0 && $verifyUser->role == "USER") {
            return response()->json([
                'status' => 200,
                'user' => $request->username,
                'role' => "USER",
                'access' => 5,
                'changepass' => true,
                'message' => "Please set your permanent password!"
            ], 200);
        }

        if ($verifyUser) {
            if($verifyUser->access_level >= 5) {
                User::where('username', $verifyUser->username)->update(['last_online' => Carbon::now()]);
                /** @var \App\Models\User $user */
                $user = Auth::user();
                $expirationTime = now()->addMinutes(60);
                $token = $user->createToken($user->username, ['expires_at' => $expirationTime])->plainTextToken;
                $cookie = cookie('jwt', $token, 60);
                
                return response()->json([
                    'status' => 200,
                    'user' => $user->username,
                    'role' => $user->role,
                    'access' => $user->access_level,
                    'access_token' => $token,
                    'message' => "Login Success!"
                ])->withCookie($cookie);
            }
            else {
                return response()->json([
                    'message' => 'Access denied for this account!'  
                ]);
            }
        } else {
            return response()->json([
                'message' => 'Account no longer active!'  
            ]);
        }
    }

    // THis is the logic where set permanent password is handle
    public function setpermanentpassword(Request $request) {
        $validator = Validator::make($request->all(), [
            'username' => 'required',
            'newpassword' => 'required',
            'confirmpassword' => 'required',
        ]);

        if ($request->newpassword != $request->confirmpassword) {
            return response()->json([
                'message' => "Password did not match!"
            ]);
        }

        $pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/';
        if(!preg_match($pattern, $request->newpassword)) {
            return response()->json([
                'message' => 'Password must contain capital and small letter, number, and special character!'
            ]);    
        }

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }

        $easyguess = Password::where('list', $request->password)->first();
        if($easyguess) {
            return response()->json([
                'message' => 'Change your password, it is easy to guess!'
            ]);    
        }

        $verifyUser = User::select('username', 'access_level', 'role', 'password_change')
            ->whereNull('deleted_at')
            ->where('username', $request->username)
            ->first();

        if ($verifyUser) {
            $hashedPassword = Hash::make($request->newpassword);
            $update = User::where('username', $verifyUser->username)
                ->update([ 'password' => $hashedPassword, 'password_change' => 1, 'account_status' => 1]);
            if($update) {   
                return response()->json([
                    'status' => 200,
                    'changepass' => true,
                    'message' => 'Password changed successfully! Use it to login.'
                ], 200);
            }
            else {
                return response()->json([
                    'message' => 'Something went wrong!'
                ]);
            }
        }
        else {
            return response()->json([
                'message' => 'Cannot find your account!'
            ]);
        }
    }
    
    public function user(Request $request) {
        $authUser = Auth::user();
        $role = $authUser->role == "ADMIN" ? "admins" : "students";

        $userInfo = User::leftJoin($role, 'users.username', '=', $role.'.username')
            ->select(
                $role.'.*', 
                'users.password', 
                $role.'.name as fullname',
                DB::raw("DATE_FORMAT(users.last_online, '%M %d, %Y') as last_online")
            )
            ->where('users.username', $authUser->username)
            ->first();

        $sysem_detail = App_Info::select('system_info',
            DB::raw("TO_BASE64(org_structure) as org_structure"),
            DB::raw("TO_BASE64(logo) as logo"),
            )
        ->first();

        if($userInfo) {
            return response()->json([
                'authorizedUser' => $userInfo,
                'sysem_detail' => $sysem_detail,                
                'message' => "Access Granted!",
            ]);
        }
        else {
            return response()->json([
                'message' => "Access Denied!"
            ]);
        }
    }

    public function logout() {
        $cookie = Cookie::forget('jwt');
        return response()->json([
            'message' => "Session End!"
        ])->withCookie($cookie);
    }
}
