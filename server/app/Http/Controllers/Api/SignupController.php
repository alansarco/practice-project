<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpStringsEmail;
use App\Models\OTP;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Password;
use App\Models\Suffix;
use Illuminate\Support\Str;
use Exception;
use Illuminate\Support\Facades\Mail;

class SignupController extends Controller
{
    public function signupsuffix() {
        try {
            $suffix = Suffix::select("id", "title")->orderBy("id", "ASC")->get();

            if($suffix->count() > 0) {
                return response()->json([
                    'suffix' => $suffix,
                    'message' => 'Suffix retrieved!',
                ]);
            }
            else {
                return response()->json([
                    'message' => 'No suffix found!'
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

    public function createotp(Request $request) {
        try {
            $easyguess = Password::where('list', $request->password)->first();
            if($easyguess) {
                return response()->json([
                    'message' => 'Change your password, it is easy to guess!'
                ]);    
            }
            $pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/';
            if(!preg_match($pattern, $request->password)) {
                return response()->json([
                    'message' => 'Password must contain capital and small letter, number, and special character!'
                ]);    
            }
            $validator = Validator::make($request->all(), [ 
                'username' => 'required',
                'firstname' => 'required',
                'lastname' => 'required',
                'contact' => 'required',
                'password' => 'required',   
            ]);
            if($validator->fails()) {
                return response()->json([
                    'message' => $validator->messages()
                ]);
            }
            else {
                $user = DB::table('users')->where('username', $request->username)->first();
                if($user) {
                    return response()->json([
                        'message' => 'Username exist!'
                    ]);        
                }
                else {
                    $otp = Str::random(6);
    
                    $existingOTP = OTP::where('id', $otp)->first();
        
                    while ($existingOTP) {
                          $otp = Str::random(6);
                          $existingOTP = OTP::where('id', $otp)->first();
                    }
                    $otpSent = Mail::to($request->username)->send(new OtpStringsEmail($otp));
        
                    $newOTP = OTP::create([
                          'id' => $otp,
                          'valid_for' => $request->username,
                          'expires_at' => now()->addMinutes(5), 
                    ]);   
        
                    if($otpSent && $newOTP) {
                          return response()->json([
                                'status' => 200,  
                                'message' => "OTP is sent to your email"
                          ], 200);
                    }
                    
                    return response()->json([
                          'status' => 404,
                          'message' => "Something went wrong in generating OTP"
                    ], 404);
                }
            }
        }
        catch (Exception $e) {
            return response()->json([
                'status' => 404,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function signupuser(Request $request) {
        $checkOTP = OTP::where('id', $request->otp_code)->where('valid_for', $request->username)->where('expires_at', ">", now())->first();

        if($checkOTP) {
            $validator = Validator::make($request->all(), [ 
                'username' => 'required',
                'firstname' => 'required',
                'lastname' => 'required',
                'contact' => 'required',
                'password' => 'required',   
            ]);
    
            if($validator->fails()) {
                return response()->json([
                    'message' => $validator->messages()
                ]);
            }
    
            else {
                $user = DB::table('users')->where('username', $request->username)->first();
                if($user) {
                    return response()->json([
                        'message' => 'Username exist!'
                    ]);        
                }
                else {
                    try {
                        $add = User::create([
                            'username' => $request->username,
                            'password' => $request->password,
                            'role' => 'USER',
                            'access_level' => 5,
                            'firstname' => $request->firstname,
                            'middlename' => $request->middlename,
                            'lastname' => $request->lastname,
                            'suffix' => $request->suffix,
                            'contact' => $request->contact,
                            'account_status' => '1',
                            'created_by' => ''
                        ]);

                        OTP::where('id', $request->otp_code)->delete();
            
                        if($add) {
                            return response()->json([
                                'status' => 200,
                                'message' => 'User verified successfully!'
                            ], 200);
                        }
                        else {
                            return response()->json([
                                'message' => 'Oops... Something went wrong!'
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
        else {
            return response()->json([
                'message' => 'Invalid OTP!'
            ]);
        }
  }
}
