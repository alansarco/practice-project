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
    // Get all the list of system info
    public function index() {
        $settings = App_Info::select('*',
            DB::raw("TO_BASE64(org_structure) as org_structure"),
            DB::raw("TO_BASE64(logo) as logo"),
            )
            ->get();

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
            'requirements_link' => 'required',
            'event_notif' => 'required',
            'system_info' => 'required',
            'org_structure' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }
        else {
            try {
                $requirementsData = null; // Initialize the variable to hold the file path
                if ($request->hasFile('org_structure')) {
                    $file = $request->file('org_structure');
                    $requirementsData = file_get_contents($file->getRealPath()); // Get the file content as a string
                }

                $updateData = [
                    'security_code' => $request->security_code,
                    'superadmin_limit' => $request->superadmin_limit,
                    'requirements_link' => $request->requirements_link,
                    'system_info' => $request->system_info,
                    'event_notif' => $request->event_notif,
                    'updated_by' => Auth::user()->username,
                ];
                
                // Conditionally include org_structure if a new file is uploaded
                if ($request->hasFile('org_structure')) {
                    $updateData['org_structure'] = $requirementsData;
                }
                
                // Perform the update with the conditional data array
                $update = App_Info::where('school_id', $request->schoolid)->update($updateData);

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
