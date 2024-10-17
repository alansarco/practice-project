<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Poll;
use App\Models\Position;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ElectionController extends Controller
{
    public function adminselect() {
        $admins = User::leftJoin('admins', 'users.username', '=', 'admins.username')
                ->select('admins.username', 'admins.name')
                ->where('users.account_status', 1)
                ->where('users.role', 'ADMIN')
                ->where('users.access_level', 999)
                ->orderBy('admins.name', 'ASC')
                ->get();

            if($admins->count() > 0) {
                return response()->json([
                    'admins' => $admins,
                    'message' => 'Admins retrieved!',
                ]);
            }   
            else {
                return response()->json([
                    'message' => 'No Admin Accounts found!'
                ]);
            }
    }

    public function addelection(Request $request) {
        $authUser = Admin::select('name')->where('username', Auth::user()->username)->first();
        $authAdmin = Admin::select('name')->where('username', $request->admin_id)->first();

        if (strlen($request->pollname) < 10) {
            return response()->json([
                'message' => "Election name too short!"
            ]);
        }

        $validator = Validator::make($request->all(), [
            'pollname' => 'required',
            'description' => 'required',
            'participant_grade' => 'required',
            'qualifications' => 'required',
            'requirements' => 'required',
            'admin_id' => 'required',
        ]); 

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        } 

        else {
            $existingIDs = DB::table("polls")->pluck('pollid');
            if ($existingIDs) {
                $numbers = [];
                foreach ($existingIDs as $id) {
                    $parts = explode('-', $id);
                    if (count($parts) === 2 && is_numeric($parts[1])) {
                        $numbers[] = (int)$parts[1];
                    }
                }
                $highestNumber = max($numbers);
                $newNumber = $highestNumber + 1;
            }
            else {
                $newNumber = 1;
            }
            
            // Split the election title into words
            $words = explode(' ', $request->pollname);

            // Get the first two words
            $firstWord = isset($words[0]) ? substr($words[0], 0, 5) : '';
            $secondWord = isset($words[1]) ? substr($words[1], 0, 5) : '';

            // Concatenate the results
            $result = "{$firstWord}{$secondWord}";

            // If the title is one word, get all letters up to 8
            if (count($words) === 1) {
                $result = substr($request->pollname, 0, 10);
            }

            $extensionID = strtoupper($result);
            $excessID = "{$extensionID}SNHSELECT";
            $ProjectID = substr($excessID, 0, 12);
            $newProjectID = "$ProjectID-$newNumber";    

            try {
                $addPoll = Poll::create([
                    'pollid' => strtoupper($newProjectID),
                    'pollname' => strtoupper($request->pollname),
                    'description' => $request->description,
                    'participant_grade' => $request->participant_grade,
                    'application_start' => $request->application_start,
                    'application_end' => $request->application_end,
                    'validation_end' => $request->validation_end,
                    'voting_start' => $request->voting_start,
                    'voting_end' => $request->voting_end,
                    'qualifications' => $request->qualifications,
                    'requirements' => $request->requirements,
                    'admin_id' => $request->admin_id,
                    'admin_name' => strtoupper($authAdmin->name),
                    'poll_status' => 1,
                    'created_by' => $authUser->name,
                    'updated_by' => $authUser->name
                ]);

                // Loop through the positions (from position1 to position15)
                $positions = [];
                $x = 1;
                for ($i = 1; $i <= 15; $i++) {
                    $position = $request->input("position$i");

                    // If position is not an empty string, add it to the array
                    if (!empty($position)) {
                        $positions[] = [
                            'positionid' => $x++, 
                            'pollid' => strtoupper($newProjectID), 
                            'position_name' => strtoupper($position), 
                            'created_at' => now(),  
                            'updated_at' => now(),
                            'created_by' => $authAdmin->name,
                            'updated_by' => $authAdmin->name,
                        ];
                    }
                }

                // Insert non-empty positions into the positions table
                if (!empty($positions)) {
                    Position::insert($positions);
                }
                if($addPoll) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'Election added successfully!'
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

    public function electioninfo(Request $request) {
        try {
            $election = Poll::select('*',
                DB::raw("DATE_FORMAT(voting_start, '%M %d, %Y') AS voting_starts"),
                DB::raw("DATE_FORMAT(voting_end, '%M %d, %Y') AS voting_ends"),
                DB::raw("DATE_FORMAT(application_start, '%M %d, %Y') AS application_starts"),
                DB::raw("DATE_FORMAT(application_end, '%M %d, %Y') AS application_ends"),
                DB::raw("DATE_FORMAT(validation_end, '%M %d, %Y') AS validation_ends"),
                DB::raw("DATE_FORMAT(created_at, '%M %d, %Y %h:%i %p') AS created_date"),
                DB::raw("DATE_FORMAT(updated_at, '%M %d, %Y %h:%i %p') AS updated_date"),
                )
            ->where('poll_status', 1)->where('pollid', $request->info)->first();
            $positions = Position::select('positionid', 'position_name', 'pollid')
                ->where('pollid', $request->info)->get();

            if($election) {
                return response()->json([
                    'status' => 200,
                    'election' => $election,
                    'positions' => $positions,
                    'message' => 'Election Information retrieved!',
                ], 200);
            }
            else {
                return response()->json([
                    'message' => 'No election Information found!'
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

    public function editupcoming(Request $request) {
        $authUser = Admin::select('name')->where('username', Auth::user()->username)->first();

        if($request->voting_end < $request->voting_start) {
            return response()->json([
                'message' => 'Voting end must be greater than or equal to voting start!'
            ]);
        }
        if($request->voting_start <= $request->validation_end) {
            return response()->json([
                'message' => 'Voting end must be greater than or equal to voting start!'
            ]);
        }

        $update = Poll::where('pollid', $request->pollid)->update([ 
            'voting_start' => $request->voting_start,
            'voting_end' => $request->voting_end,
            'updated_by' => $authUser->name,
        ]);

        if($update) {
            return response()->json([
                'status' => 200,
                'message' => 'Election updated successfully!'
            ], 200);
        }
        else {
            return response()->json([
                'message' => 'Something went wrong!'
            ]);
        }
    }

    public function editongoing(Request $request) {
        $authUser = Admin::select('name')->where('username', Auth::user()->username)->first();

        if($request->voting_end < $request->voting_start) {
            return response()->json([
                'message' => 'Voting end must be greater than or equal to voting start!'
            ]);
        }

        $update = Poll::where('pollid', $request->pollid)->update([ 
            'voting_end' => $request->voting_end,
            'updated_by' => $authUser->name,
        ]);

        if($update) {
            return response()->json([
                'status' => 200,
                'message' => 'Election updated successfully!'
            ], 200);
        }
        else {
            return response()->json([
                'message' => 'Something went wrong!'
            ]);
        }
    }

    public function editapplication(Request $request) {
        $authUser = Admin::select('name')->where('username', Auth::user()->username)->first();
        $authAdmin = Admin::select('name')->where('username', $request->admin_id)->first();

        $validator = Validator::make($request->all(), [
            'description' => 'required',
            'participant_grade' => 'required',
            'qualifications' => 'required',
            'requirements' => 'required',
            'admin_id' => 'required',
        ]); 

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        } 

        $update = Poll::where('pollid', $request->pollid)->update([ 
            'description' => $request->description,
            'participant_grade' => $request->participant_grade,
            'application_start' => $request->application_start,
            'application_end' => $request->application_end,
            'validation_end' => $request->validation_end,
            'voting_start' => $request->voting_start,
            'voting_end' => $request->voting_end,
            'qualifications' => $request->qualifications,
            'requirements' => $request->requirements,
            'admin_id' => $request->admin_id,
            'admin_name' => strtoupper($authAdmin->name),
            'poll_status' => 1,
            'created_by' => $authUser->name,
            'updated_by' => $authUser->name
        ]);

        if($update) {
            //If the application start, will not allow to make updates on the election positions
            if(!$request->ongoing_apply) {
                try {
                    DB::transaction(function () use ($request) {
                        $deleteposition = DB::table('positions')->where('pollid', $request->pollid)->delete();
                        $deletecandidates = DB::table('candidates')->where('pollid', $request->pollid)->delete();
                        $deletevotes = DB::table('votes')->where('pollid', $request->pollid)->delete();
                
                        if ($deleteposition === false || $deletecandidates === false || $deletevotes === false) {
                            throw new \Exception("Something went wrong!"); // This will automatically trigger a rollback
                        }
                    });
                    
                    // Loop through the positions (from position1 to position15)
                    $positions = [];
                    $x = 1;
                    for ($i = 1; $i <= 15; $i++) {
                        $position = $request->input("position$i");
        
                        // If position is not an empty string, add it to the array
                        if (!empty($position)) {
                            $positions[] = [
                                'positionid' => $x++, 
                                'pollid' => strtoupper($request->pollid), 
                                'position_name' => strtoupper($position), 
                                'created_at' => now(),  
                                'updated_at' => now(),
                                'created_by' => $authAdmin->name,
                                'updated_by' => $authAdmin->name,
                            ];
                        }
                    }
                    // Insert non-empty positions into the positions table
                    if (!empty($positions)) {
                        Position::insert($positions);
                    }

                    return response()->json([
                        'status' => 200,
                        'message' => 'Election updated successfully!'
                    ], 200);
    
                } catch (Exception $e) {
                    return response()->json([
                        'message' => $e->getMessage()
                    ]);
                }
                
            }
            return response()->json([
                'status' => 200,
                'message' => 'Election updated successfully!'
            ], 200);
        }
        else {
            return response()->json([
                'message' => 'Something went wrong!'
            ]);
        }
    }

    public function deleteelection(Request $request) {
        $authUser = Admin::select('name', 'username')->where('username', Auth::user()->username)->first();
        
        $authUserized = Auth::user();
        if($authUserized->role !== "ADMIN" || $authUserized->access_level != 999) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }
        $poll = DB::table('polls')->where('pollid', $request->pollid)->first();
        if($poll) {
            try {
                DB::transaction(function () use ($request) {
                    $deletepoll = DB::table('polls')->where('pollid', $request->pollid)->delete();
                    $deleteposition = DB::table('positions')->where('pollid', $request->pollid)->delete();
                    $deletecandidates = DB::table('candidates')->where('pollid', $request->pollid)->delete();
                    $deletevotes = DB::table('votes')->where('pollid', $request->pollid)->delete();
            
                    if ($deletepoll === false || $deleteposition === false 
                        || $deletecandidates === false || $deletevotes === false) {
                        throw new \Exception("Something went wrong!"); // This will automatically trigger a rollback
                    }
                });

                $data = [
                    'pollid' => $poll->pollid,
                    'pollname' => $poll->pollname,
                    'deleted_at' => now(),
                    'deleted_by' => $authUser->name,
                ];
                
                // Insert the data into the election_recycle_bin table
                DB::table('election_recycle_bin')->insert($data);
                return response()->json([
                    'status' => 200,
                    'message' => 'Election and its data are deleted successfully!'
                ], 200);

            } catch (Exception $e) {
                return response()->json([
                    'message' => $e->getMessage()
                ]);
            }
        }
        else {
            return response()->json([
                'message' => 'Election not found!'
            ]);
        }
    }
}
