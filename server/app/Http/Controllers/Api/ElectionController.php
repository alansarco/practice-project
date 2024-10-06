<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Poll;
use App\Models\User;
use App\Rules\ImageSize;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ElectionController extends Controller
{
    

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

            $existingIDs = DB::table("elections")->pluck('projectid');
            $numbers = [];
            foreach ($existingIDs as $id) {
                $parts = explode('-', $id);
                if (count($parts) === 2 && is_numeric($parts[1])) {
                    $numbers[] = (int)$parts[1];
                }
            }
            $highestNumber = max($numbers);
            $newNumber = $highestNumber + 1;

            // Split the election title into words
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
                $add = Poll::create([
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
            $delete = Poll::where('projectid', $request->projectid)->delete();
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
                'message' => "Poll title too short!"
            ]);
        }

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()
            ]);
        } 
        else {
            try {
                $update = Poll::where('projectid', $request->projectid)->update([ 
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
            $election = Poll::where('status', '>', 0)->where('projectid', $request->data)->first();
            if($election) {
                return response()->json([
                    'election' => $election,
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
        $election = Poll::where('projectid', $request->projectid)->first();
        if($election) {
            try {
                $delete = Poll::where('projectid', $request->projectid)->delete();
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
