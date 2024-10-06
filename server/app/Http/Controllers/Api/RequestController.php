<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Docrequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;

class RequestController extends Controller
{
    public function index(Request $request) {
        try {
            $requestors = Docrequest::leftJoin('users', 'requests.requestor', '=', 'users.username')
                  ->leftJoin('suffix', 'users.suffix', '=', 'suffix.id')
                  ->leftJoin('elections', 'requests.doctype', '=', 'elections.projectid')
                  ->select('users.username', 'requests.id', 'requests.doctype as purchaseid', 'elections.title as doctype', 'requests.quantity', 'requests.polls', 'requests.status as statusno',
                        DB::raw("CONCAT(DATE_FORMAT(requests.created_at, '%M %d, %Y')) as date_requested"),
                        DB::raw("CONCAT(DATE_FORMAT(requests.date_needed, '%M %d, %Y')) as date_needed"),
                        DB::raw("CONCAT(DATE_FORMAT(requests.date_finished, '%M %d, %Y')) as date_finished"),
                        DB::raw("CONCAT(users.lastname, ', ', users.firstname, ' ', IFNULL(CONCAT(suffix.title, ' '), ''), IFNULL(CONCAT(LEFT(users.middlename, 1), '.'), '')) as fullname"),
                        DB::raw('CASE
                              WHEN requests.status = 1 THEN "pending" 
                              WHEN requests.status = 2 THEN "processing"
                              WHEN requests.status = 3 THEN "delivery"
                              WHEN requests.status = 4 THEN "received"
                              ELSE "cancelled"
                              END AS status'),
                  )
                  ->where('requests.status', '>', 0)
                  ->whereNull('users.deleted_at') 
                  ->where(function ($query) use ($request) {
                        $query->where('users.username', 'like', '%' . $request->filter . '%')
                              ->orWhere('users.firstname', 'like', '%' . $request->filter . '%')
                              ->orWhere('users.lastname', 'like', '%' . $request->filter . '%')
                              ->orWhere('users.middlename', 'like', '%' . $request->filter . '%');
                        })
                  ->orderBy('fullname', 'ASC')->get();

            if($requestors->count() > 0) {
                return response()->json([
                    'requestors' => $requestors,
                    'message' => 'Doc Requests retrieved!',
                ]);
            }
            else {
                return response()->json([
                    'message' => 'No requests found!'
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

    public function requestorinfo(Request $request) {
        $requestor = Docrequest::leftJoin('users', 'requests.requestor', '=', 'users.username')
                  ->leftJoin('suffix', 'users.suffix', '=', 'suffix.id')
                  ->leftJoin('elections', 'requests.doctype', '=', 'elections.projectid')
                  ->select('users.username', 'requests.id', 'requests.status', 'users.firstname', 'users.middlename', 'users.lastname', 'suffix.title', 'requests.doctype as purchaseid', 'elections.title as doctype',
                        DB::raw("CONCAT(DATE_FORMAT(requests.created_at, '%M %d, %Y')) as date_requested"),
                        DB::raw("CONCAT(DATE_FORMAT(requests.date_needed, '%M %d, %Y')) as date_needed"),
                        DB::raw("CONCAT(users.lastname, ', ', users.firstname, ' ', IFNULL(CONCAT(suffix.title, ' '), ''), IFNULL(CONCAT(LEFT(users.middlename, 1), '.'), '')) as fullname")
                  )
                    ->where('requests.status', '>', 0)
                    ->whereNull('users.deleted_at') 
                    ->where('requests.id', $request->data)->first();

                if($requestor) {
            return response()->json([
                'status' => 200,
                'requestor_info' => $requestor,
                'message' => "Requestor info retrieved!"
            ], 200);
        }
        else {
            return response()->json([
                'message' => "Requestor not found or resident already removed!"
            ]);
        }
    }

    public function editrequest(Request $request) {
        $authUser = Auth::user();
        if($authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }

        $requestor = Docrequest::where('id', $request->id)->first();
        if($requestor) {
            try {
                if($requestor->status == 4 && $requestor->status != $request->status) {
                    return response()->json([
                        'message' => 'Operation invalid, this request already finished!'
                    ]);
                }
                if($requestor->status == 0) {
                    $delete = Docrequest::where('id', $request->id)->delete();
                    if($delete) {
                        return response()->json([
                            'status' => 200,
                            'message' => 'Request is removed/cancelled successfully!'
                        ], 200);
                    }
                    return response()->json([
                        'message' => 'Something went wrong!'
                    ]);
                }
                
                $update = Docrequest::where('id', $request->id)->update([ 
                    'status' => $request->status,
                    'date_finished' => today(),
                ]);
                if($update) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'Order updated successfully!'
                    ], 200);                    
                }
                return response()->json([
                    'message' => 'Something went wrong!'
                ]);
            } catch (Exception $e) {
                return response()->json([
                    'message' => $e->getMessage()
                ]);
            }
        } else {
            return response()->json([
                'message' => 'Order not found!'
            ]);
        }
    }
}
