<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Admin;
use App\Models\App_Info;
use App\Models\Calendar;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;

class SettingsController extends Controller
{
    // Get all the list of admins
    public function index() {
        $settings = App_Info::get();

        return response()->json([
            'settings' => $settings,
        ]);
    }

    // update settings's information
    public function updatesettings(Request $request) {
        $authUser = Auth::user();
        
        if($authUser->role !== "ADMIN" || $authUser->access_level != 999) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }

        $validator = Validator::make($request->all(), [
            'security_code' => 'required',
            'superadmin_limit' => 'required',
            'event_notif' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }
        else {
            try {
                $update = App_Info::where('school_id', $request->schoolid)
                ->update([
                    'security_code' => $request->security_code,
                    'superadmin_limit' => $request->superadmin_limit,
                    'event_notif' => $request->event_notif,
                    'updated_by' => Auth::user()->username,
                ]);

            if($update) {
                return response()->json([
                    'status' => 200,
                    'message' => 'System updated successfully!'
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
