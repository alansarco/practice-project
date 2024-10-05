<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Http\Controllers\Controller;
use App\Models\Docrequest;
use App\Models\Election;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    //returns data of Ither Statistics
      public function index() 
      {
            $authUser = Auth::user();

            $products = Election::where('status', 1)->orderBy('budget', 'DESC')->get();

            $activeorder = Docrequest::leftJoin('elections', 'requests.doctype', '=', 'elections.projectid')
                  ->selectRaw("requests.*, elections.title, CONCAT(DATE_FORMAT(requests.created_at, '%M %d, %Y %h:%i %p')) as myorder_date")
                  ->where('requests.status', '>', 0)
                  ->where('elections.status', 1)
                  ->where('requests.status', '<', 4)
                  ->where('requests.requestor', $authUser->username)
                  ->orderBy('requests.status')
                  ->orderBy('requests.created_at', 'DESC')
                  ->get();

            $pastorder = Docrequest::leftJoin('elections', 'requests.doctype', '=', 'elections.projectid')
                  ->selectRaw("requests.*, elections.title, CONCAT(DATE_FORMAT(requests.created_at, '%M %d, %Y %h:%i %p')) as myorder_date")
                  ->where('requests.status', 4)
                  ->where('requests.requestor', $authUser->username)
                  ->orderBy('requests.created_at', 'DESC')
                  ->get();
            
            $applications = [
                  'products' => $products,
                  'activeorder' => $activeorder,
                  'pastorder' => $pastorder,
            ];

        return response()->json([
            'applications' => $applications,
        ]);
      }

      public function ordernow(Request $request) 
      {
            $authUser = Auth::user();
            $current_date = Carbon::today();
            $current_time = Carbon::now()->toTimeString();

            $getprojectid = Election::where('projectid', $request->projectid)->first();

            $receipt = rand(1000000, 9999999);
            $existingReceipt = Docrequest::where('requests.receipt_no', $receipt)->first();

            $total = $request->purchase_qty * $getprojectid->price;
        
            while ($existingReceipt) {
                  $receipt = rand(1000000, 9999999);
                  $existingReceipt = Docrequest::where('requests.receipt_no', $receipt)->first();
            }
            try {
                  $add = Docrequest::create([
                        'requestor' => $authUser->username,
                        'date_needed' => $current_date,
                        'status' => 1,
                        'quantity' => $request->purchase_qty,
                        'receipt_no' => $receipt,
                        'price' => $getprojectid->price,
                        'sales' => $total,
                        'doctype' => $request->projectid,
                        'created_by' => $authUser->username
                  ]);
        
                  if($add) {
                        Election::where('projectid', $request->projectid)->update([ 
                              'budget' => $getprojectid->budget + $getprojectid->price,
                              'updated_at' => today(),
                        ]);
                        return response()->json([
                            'status' => 200,
                            'message' => 'Order successfull!'
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

      public function cancelorder(Request $request) 
      {
            $activeBooking = Docrequest::where('id', $request->id)->first();
            $getprojectid = Election::where('projectid', $activeBooking->doctype)->first();

            $updateActiveBooking = Docrequest::where('id', $request->id)->update([ 
                  'status' => 0,
                  'deleted_at' => today(),
            ]);

            if($updateActiveBooking) {
                  try {
                        Election::where('projectid', $request->projectid)->update([ 
                              'budget' => $getprojectid->budget - $activeBooking->price,
                              'updated_at' => today(),
                        ]);
                        return response()->json([
                            'status' => 200,
                            'message' => 'Order cancelled successfully!'
                        ], 200);
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
