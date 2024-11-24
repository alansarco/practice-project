<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\App_Info;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class OrganizationController extends Controller
{
    public function index(Request $request) {
        $query = Organization::leftJoin('admins', 'organizations.created_by', '=', 'admins.username')
            ->select('organizations.*', 'admins.name as added_by', DB::raw("DATE_FORMAT(organizations.created_at, '%M %d, %Y %h:%i %p') AS created_date"))
            ->orderBy('org_name', 'DESC');

        if($request->filter) {
            $organizations = $query->where('org_name', $request->filter)->paginate(2);
        }
        else{
            $organizations = $query->paginate(20);
        }

        if($organizations) {
            return response()->json([
                'organizations' => $organizations,
                'message' => 'Orgs retrieved!',
            ]);
        }   
        else {
            return response()->json([
                'organizations' => $organizations,
                'message' => 'No orgs  found!'
            ]);
        }
    }

    public function orgselect() {
        $orgs = Organization::orderBy('org_name', 'ASC')->get();

            if($orgs->count() > 0) {
                return response()->json([
                    'orgs' => $orgs,
                    'message' => 'Orgs retrieved!',
                ]);
            }   
            else {
                return response()->json([
                    'message' => 'No orgs  found!'
                ]);
            }
    }
    public function addorg(Request $request) {
        $validator = Validator::make($request->all(), [ 
            'org_name' => 'required|unique:organizations,org_name',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }

        $addOrg = Organization::create([
            'org_name' => $request->org_name,
            'created_by' => Auth::user()->username,
        ]);

        if($addOrg) {
            return response()->json([
                'status' => 200,
                'message' => 'Organization added successfully!'
            ], 200);
        }
        return response()->json([
            'message' => 'Something went wrong!'
        ]);
    }

    public function deleteorg(Request $request) {
        $delete = Organization::where('org_name', $request->org_name)->delete();

        if($delete) {
            return response()->json([
                'status' => 200,
                'message' => 'Organization deleted successfully!'
            ], 200);
        }
        return response()->json([
            'message' => 'Something went wrong!'
        ]);
    }

}
