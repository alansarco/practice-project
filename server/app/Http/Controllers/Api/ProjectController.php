<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Project;
use App\Rules\ImageSize;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    public function index(Request $request) {
        try {
            $projects = Project::select('projectid', 'title', 'budget', 'status', 
                DB::raw("CONCAT(DATE_FORMAT(created_at, '%M %d, %Y')) as date_added"),
                DB::raw('CASE
                    WHEN status = 1 THEN "Active" 
                    WHEN status = 2 THEN "Inactive"
                    ELSE "Unknown"
                    END AS status'),
                DB::raw('CASE
                    WHEN status = 1 THEN "info" 
                    WHEN status = 2 THEN "warning"
                    ELSE "dark"
                    END AS color')
                )
            ->where('status', '>', 0)
            ->where('status', '<', 4)
            ->where(function ($query) use ($request) {
                $query->where('projectid', 'like', '%' . $request->filter . '%')
                    ->orWhere('title', 'like', '%' . $request->filter . '%');
                })
            ->orderBy('status', 'ASC')
            ->orderBy('budget', 'DESC') 
            ->get();

            if($projects->count() > 0) {
                return response()->json([
                    'projects' => $projects,
                    'message' => 'Products retrieved!',
                ]);
            }
            else {
                return response()->json([
                    'message' => 'No products found!'
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

    public function addproject(Request $request) {
        $authUser = Auth::user();

        $image = $request->picture;

        $validator = Validator::make($request->all(), [
            'title' => 'required',
            'price' => 'required',
            'picture' => ['required', 'image'],    
        ]); 

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()
            ]);
        } 
        else {
            if ($request->hasFile('picture')) {
                // Process and store the file
                $file = $request->file('picture');
                
                // Store the file in the filesystem
                $path = $file->store('uploads');
            }
            else {
                return response()->json([
                    'message' => 'Invalid File!'
                ]);
            }
            $status = $request->status == null ? "1" : $request->status;

            $existingIDs = DB::table("projects")->pluck('projectid');
            $numbers = [];
            foreach ($existingIDs as $id) {
                $parts = explode('-', $id);
                if (count($parts) === 2 && is_numeric($parts[1])) {
                    $numbers[] = (int)$parts[1];
                }
            }
            $highestNumber = max($numbers);
            $newNumber = $highestNumber + 1;

            // Split the project title into words
            $words = explode(' ', $request->title);

            // Get the first two words
            $firstWord = isset($words[0]) ? substr($words[0], 0, 5) : '';
            $secondWord = isset($words[1]) ? substr($words[1], 0, 5) : '';

            // Concatenate the results
            $result = $firstWord . $secondWord;

            // If the title is one word, get all letters up to 8
            if (count($words) === 1) {
                $result = substr($request->title, 0, 10);
            }

            $extensionID = strtoupper($result);
            $excessID = $extensionID."PROJECTBRGY";
            $ProjectID = substr($excessID, 0, 12);
            $newProjectID = "$ProjectID-$newNumber";    

            try {
                $add = Project::create([
                    'projectid' => $newProjectID,
                    'title' => $request->title,
                    'description' => $request->description,
                    'price' => $request->price,
                    'status' => $status,
                    'picture' => $path,
                    'created_by' => $authUser->username
                ]);
        
                if($add) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'Product added successfully!'
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


    public function editproject(Request $request) {
        $validator = Validator::make($request->all(), [
            'title' => 'required',
            'price' => 'required',
        ]);
        
        if($request->status == 0) {
            $delete = Project::where('projectid', $request->projectid)->delete();
            if($delete) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Product cancelled successfully!'
                ], 200);  
            } else {
                return response()->json([
                    'message' => 'Something went wrong!'
                ]);
            }
        }

        if (strlen($request->title) < 10) {
            return response()->json([
                'message' => "Project title too short!"
            ]);
        }

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()
            ]);
        } 
        else {
            try {
                $update = Project::where('projectid', $request->projectid)->update([ 
                    'title' => $request->title,
                    'description' => $request->description,
                    'status' => $request->status,
                    'price' => $request->price,
                ]);

                if($update) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'Product updated successfully!'
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

    public function projectinfo(Request $request) {
        try {
            $project = Project::where('status', '>', 0)->where('projectid', $request->data)->first();
            if($project) {
                return response()->json([
                    'project' => $project,
                    'message' => 'Product data retrieved!',
                ]);
            }
            else {
                return response()->json([
                    'message' => 'No product info found!'
                ]);
            }
        }
        catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ]);
        }
    }

    public function deleteproject(Request $request) {
        $project = Project::where('projectid', $request->projectid)->first();
        if($project) {
            try {
                $delete = Project::where('projectid', $request->projectid)->delete();
                if($delete) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'Product deleted successfully!'
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
                'message' => 'Product not found!'
            ]);
        }
    }

}
