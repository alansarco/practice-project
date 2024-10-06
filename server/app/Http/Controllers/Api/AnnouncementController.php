<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Admin;
use App\Models\Calendar;
use Exception;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    // Get all the list of admins
    public function index(Request $request) {
        $upcomingevents = Calendar::select('*',
            DB::raw("CONCAT(DATE_FORMAT(event_date, '%M %d, %Y'), ' ', DATE_FORMAT(time, '%h:%i %p')) as event_datetime")
            )
            ->where('event_date', '>=', DB::raw('CURDATE()'))
            ->get();
            
        $pastevents = Calendar::select('*',
            DB::raw("CONCAT(DATE_FORMAT(event_date, '%M %d, %Y'), ' ', DATE_FORMAT(time, '%h:%i %p')) as event_datetime")
            )
            ->where('event_date', '<', DB::raw('CURDATE()'))
            ->get();

        $calendars = [
            'upcomingevents' => $upcomingevents,
            'pastevents' => $pastevents,
        ];

        return response()->json([
            'calendars' => $calendars,
        ]);
    }

    // retrieve specific event's information
    public function retrieve(Request $request) {
        $event = Calendar::where('id', $request->id)->first();
        
        if($event) {
            return response()->json([
                'status' => 200,
                'calendar' => $event,
                'message' => "Event data retrieved!"
            ], 200);
        }
        else {
            return response()->json([
                'calendar' => $event,
                'message' => "Event not found!"
            ]);
        }
    }

    // update specific admin's information
    public function updateannouncement(Request $request) {
        $authUser = Auth::user();
        
        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }

        $validator = Validator::make($request->all(), [
            'event_name' => 'required',
            'description' => 'required',
            'hashtag1' => 'required',
            'hashtag2' => 'required',
            'hashtag3' => 'required',
            'color' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()
            ]);
        }
        else {
            try {
                $update = Calendar::where('id', $request->id)
                ->update([
                    'event_name' => strtoupper($request->event_name),
                    'description' => $request->description,
                    'details' => $request->details,
                    'event_date' => $request->event_date,
                    'time' => $request->time,
                    'hashtag1' => $request->hashtag1,
                    'hashtag2' => $request->hashtag2,
                    'hashtag3' => $request->hashtag3,
                    'color' => $request->color,
                    'updated_by' => Auth::user()->username,
                ]);

            if($update) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Event updated successfully!'
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

    public function addannouncement(Request $request) {
        $authUser = Auth::user();
        
        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }

        $validator = Validator::make($request->all(), [ 
            'event_name' => 'required',
            'description' => 'required',
            'hashtag1' => 'required',
            'hashtag2' => 'required',
            'hashtag3' => 'required',
            'color' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()
            ]);
        }

        $add = Calendar::create([
            'event_name' => strtoupper($request->event_name),
            'description' => $request->description,
            'details' => $request->details,
            'event_date' => $request->event_date,
            'time' => $request->time,
            'hashtag1' => $request->hashtag1,
            'hashtag2' => $request->hashtag2,
            'hashtag3' => $request->hashtag3,
            'color' => $request->color,
            'created_by' => Auth::user()->username,
        ]);

        if($add) {
            return response()->json([
                'status' => 200,
                'message' => 'Announcement added successfully!'
            ], 200);
        }
        return response()->json([
            'message' => 'Something went wrong!'
        ]);
    }

    public function deleteannouncement(Request $request) {
        $authUser = Auth::user();

        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }

        $delete = Calendar::where('id', $request->id)->delete();

        if($delete) {
            return response()->json([
                'status' => 200,
                'message' => 'Announcement removed successfully!'
            ], 200);
        }
        return response()->json([
            'message' => 'Something went wrong!'
        ]);
    }
    
}
