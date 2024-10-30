<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Poll;
use App\Models\Position;
use App\Models\Student;
use App\Models\User;
use App\Models\Vote;
use Carbon\Carbon;
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
            $havepolls = DB::table("polls")->first();
            $existingIDs = DB::table("polls")->pluck('pollid');
            if ($havepolls && $existingIDs) {
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

    public function positionselect(Request $request) {
        
        $positions = Position::select('positionid', 'pollid', 'position_name')
                ->where('pollid', $request->pollid)->get();

            if($positions->count() > 0) {
                return response()->json([
                    'positions' => $positions,
                    'message' => 'Positions retrieved!',
                ]);
            }   
            else {
                return response()->json([
                    'message' => 'No Positions found!'
                ]);
            }
    }

    public function checkifapplied(Request $request) {
        $authUser = Auth::user();
        
        //this will check if there is existing application under this user
        $application = Candidate::leftJoin('students', 'candidates.candidateid', '=', 'students.username')
            ->leftJoin('positions', function($join) {
                $join->on('candidates.positionid', '=', 'positions.positionid')
                    ->on('candidates.pollid', '=', 'positions.pollid');
            })
            ->select('candidates.candidateid', 'candidates.positionid', 'candidates.pollid', 
                'candidates.requirements', 'positions.position_name', 'candidates.party', 
                'candidates.platform', 'candidates.status',
                DB::raw("CONCAT('storage/', candidates.requirements) as requirements_url")
            )
            ->whereNotNull('positions.position_name')
            ->where('candidates.pollid', $request->info)
            ->where('candidates.candidateid', $authUser->username)
            ->first();

        //this will check if there are other applications under his name
        $otherapplication = Candidate::leftJoin('polls', 'candidates.pollid', '=', 'polls.pollid')
            ->select('candidates.candidateid', 'candidates.positionid', 'candidates.pollid', 
                'candidates.party', 'candidates.platform', 'candidates.status', 'polls.voting_end'
            )
            ->where('polls.pollid', '!=', $request->info)
            ->where('polls.voting_end','>' , Carbon::today()->toDateString())
            ->where('candidates.candidateid', $authUser->username)
            ->where('candidates.status', '!=', 2)
            ->first();

        if($application || $otherapplication) {
            return response()->json([
                'application' => $application,
                'otherapplication' => $otherapplication,
                'message' => 'Application Retrieved!',
            ]);
        }   
        else {
            return response()->json([
                'application' => $application,
                'otherapplication' => $otherapplication,
                'message' => 'No application found!'
            ]);
        }
    }

    public function sumbitapplication(Request $request) {
        $authUser = Student::select('name', 'username', 'grade')->where('username', Auth::user()->username)->first();

        $validator = Validator::make($request->all(), [
            'pollid' => 'required',
            'party' => 'required',
            'platform' => 'required',
            'requirements' => 'required|mimes:zip|max:10240', 
        ]); 

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        } 

        // Process the validated data, like storing the file, etc.
        $requirementsPath = null; // Initialize the variable to hold the file path
        if ($request->hasFile('requirements')) {
            $file = $request->file('requirements');
            $requirementsPath = $file->store('uploads/requirements'); // Store the file and get its path
            // $requirementsPath = $file->store('uploads/requirements', 'public');
        }
        
        $existingApplication = Candidate::where('pollid', $request->pollid)
        ->where('positionid', $request->positionid)
        ->where('party', strtoupper($request->party))  // Check for the same party
        ->where('status', '!=', 2)  // Exclude rejected application
        ->first();

        if ($existingApplication) {
            return response()->json([
                'message' => 'An application from this party already exists for the selected position!'
            ]);
        }
        
        $application = Candidate::leftJoin('students', 'candidates.candidateid', '=', 'students.username')
            ->leftJoin('positions', function($join) {
                $join->on('candidates.positionid', '=', 'positions.positionid')
                    ->on('candidates.pollid', '=', 'positions.pollid');
            })
            ->select('candidates.candidateid', 'candidates.positionid', 'candidates.pollid', 
                'positions.position_name', 'candidates.party', 'candidates.platform', 'candidates.status'
            )
            ->whereNotNull('positions.position_name')
            ->where('candidates.pollid', $request->info)
            ->where('candidates.candidateid', $authUser->username)
            ->first();

        $otherapplication = Candidate::leftJoin('polls', 'candidates.pollid', '=', 'polls.pollid')
            ->select('candidates.candidateid', 'candidates.positionid', 'candidates.pollid', 
                'candidates.party', 'candidates.platform', 'candidates.status', 'polls.voting_end'
            )
            ->where('polls.pollid', '!=', $request->info)
            ->where('polls.voting_end','>' , Carbon::today()->toDateString())
            ->where('candidates.candidateid', $authUser->username)
            ->where('candidates.status', '!=', 2)
            ->where('candidates.party', '!=', strtoupper($request->party))
            ->first();

        if($application || $otherapplication) {
            return response()->json([
                'message' => 'Seems like you have already active application!'
            ]);
        }   
        else {
            $addCandidate = Candidate::create([
                'candidateid' => strtoupper($authUser->username),
                'pollid' => strtoupper($request->pollid),
                'positionid' => $request->positionid,
                'candidate_name' => $authUser->name,
                'party' => strtoupper($request->party),
                'grade' => strtoupper($authUser->grade),
                'platform' => $request->platform,
                'requirements' => $requirementsPath,
                'status' => 0,
                'created_by' => $authUser->name,
                'updated_by' => $authUser->name
            ]);
            if($addCandidate) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Application submitted successfully!'
                ], 200);
            }
            return response()->json([
                'message' => 'Something went wrong!'
            ]);
            
        }
    }

    public function deleteapplication(Request $request) {
        try {
            $deleteapplication = DB::table('candidates')
                ->where('pollid', $request->pollid)
                ->where('candidateid', $request->candidateid)
                ->where('status', '!=', 1)
                ->delete();
                
            if($deleteapplication) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Your application has been deleted successfully!'
                ], 200);
            }   
            return response()->json([
                'message' => 'Something went Wrong!'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ]);
        }
    }

    public function viewapplications(Request $request) {
        $applications = Position::select(
            'positions.positionid',
            'positions.position_name',
            DB::raw('IFNULL((
                SELECT GROUP_CONCAT(
                    CONCAT(
                        \'{"candidateid": "\', candidates.candidateid,
                        \'", "candidate_name": "\', candidates.candidate_name,
                        \'", "pollid": "\', candidates.pollid,
                        \'", "positionid": "\', candidates.positionid,
                        \'", "grade": "\', candidates.grade,
                        \'", "party": "\', candidates.party,
                        \'", "platform": "\', candidates.platform,
                        \'", "status": "\', candidates.status, 
                        \'"}\'
                    ) SEPARATOR \',\'
                )
                FROM candidates
                WHERE candidates.positionid = positions.positionid
                AND candidates.pollid = positions.pollid
            ), \'[]\') AS candidates')
        )
        ->where('positions.pollid', $request->info)
        ->groupBy('positions.positionid', 'positions.position_name', 'positions.pollid')
        ->get();

        if($applications) {
            return response()->json([
                'applications' => $applications,
                'message' => 'Application List Retrieved!',
            ]);
        }   
        else {
            return response()->json([
                'applications' => $applications,
                'message' => 'No applications found!'
            ]);
        }
    }

    public function approveapplication(Request $request) {
        $authUser = Admin::select('name')->where('username', Auth::user()->username)->first();
        try {
            $existingApplication = Candidate::where('pollid', $request->pollid)
                ->where('positionid', $request->positionid)
                ->where('party', $request->party)  // Check for the same party
                ->where('status', '!=', 2)  // Exclude rejected application
                ->where('status', 1)  // Exclude rejected application
                ->first();

            if ($existingApplication) {
                return response()->json([
                    'message' => 'An application from this party already exists for the selected position!'
                ]);
            }
            
            $application = Candidate::leftJoin('students', 'candidates.candidateid', '=', 'students.username')
                ->leftJoin('positions', function($join) {
                    $join->on('candidates.positionid', '=', 'positions.positionid')
                        ->on('candidates.pollid', '=', 'positions.pollid');
                })
                ->select('candidates.candidateid', 'candidates.positionid', 'candidates.pollid', 
                    'positions.position_name', 'candidates.party', 'candidates.platform', 'candidates.status'
                )
                ->whereNotNull('positions.position_name')
                ->where('candidates.pollid', $request->info)
                ->where('candidates.candidateid', $authUser->username)
                ->first();

            $otherapplication = Candidate::leftJoin('polls', 'candidates.pollid', '=', 'polls.pollid')
                ->select('candidates.candidateid', 'candidates.positionid', 'candidates.pollid', 
                    'candidates.party', 'candidates.platform', 'candidates.status', 'polls.voting_end'
                )
                ->where('polls.pollid', '!=', $request->info)
                ->where('polls.voting_end','>' , Carbon::today()->toDateString())
                ->where('candidates.candidateid', $authUser->username)
                ->where('candidates.status', '!=', 2)
                ->where('candidates.party', '!=', $request->party)
                ->first();

            if($application || $otherapplication) {
                return response()->json([
                    'message' => 'Seems like you have already active application!'
                ]);
            }   

            $update = Candidate::where('pollid', $request->pollid)
                ->where('candidateid', $request->candidateid)
                ->where('positionid', $request->positionid)
                ->update([ 
                'status' => 1,
                'updated_by' => $authUser->name,
            ]);

            Candidate::where('pollid', $request->pollid)
                ->where('candidateid', '!=', $request->candidateid)
                ->where('positionid', $request->positionid)
                ->where('party', $request->party)
                ->update([ 
                'status' => 2,
                'updated_by' => $authUser->name,
            ]);
                
            if($update) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Application has been approved!'
                ], 200);
            }   
            return response()->json([
                'message' => 'Something went Wrong!'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ]);
        }
    }

    public function rejectapplication(Request $request) {
        $authUser = Admin::select('name')->where('username', Auth::user()->username)->first();
        try {
            $update = Candidate::where('pollid', $request->pollid)
                ->where('candidateid', $request->candidateid)
                ->where('positionid', $request->positionid)
                ->update([ 
                'status' => 2,
                'updated_by' => $authUser->name,
            ]);
                
            if($update) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Application has been rejected!'
                ], 200);
            }   
            return response()->json([
                'message' => 'Something went Wrong!'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ]);
        }
    }


    public function liveresult(Request $request) {
        try {
            $liveresult = Candidate::leftJoin('positions', function ($join) {
                $join->on('candidates.positionid', '=', 'positions.positionid')
                     ->on('candidates.pollid', '=', 'positions.pollid');
            })
            ->select(
                'candidates.candidateid',
                'candidates.positionid',
                'candidates.pollid',
                'positions.position_name',
                'candidates.party',
                'candidates.platform',
                'candidates.status',
                'candidates.votes',
                DB::raw("CONCAT(positions.position_name, ': ', candidates.candidateid) as label"),
                DB::raw('(
                    SELECT 
                        CONCAT(COUNT(CASE WHEN s.gender = "M" THEN 1 END), 
                        ",", COUNT(CASE WHEN s.gender = "F" THEN 1 END)
                        )
                    FROM votes v
                    LEFT JOIN students s 
                        ON v.voterid = s.username 
                    WHERE v.candidateid = candidates.candidateid
                        AND v.pollid = positions.pollid
                ) as voters_info'),
                DB::raw('(
                    SELECT 
                        CONCAT(COUNT(CASE WHEN s.grade = "7" THEN 1 END), 
                        ",", COUNT(CASE WHEN s.grade = "8" THEN 1 END),
                        ",", COUNT(CASE WHEN s.grade = "9" THEN 1 END),
                        ",", COUNT(CASE WHEN s.grade = "10" THEN 1 END),
                        ",", COUNT(CASE WHEN s.grade = "11" THEN 1 END),
                        ",", COUNT(CASE WHEN s.grade = "12" THEN 1 END)
                        )
                    FROM votes v
                    LEFT JOIN students s 
                        ON v.voterid = s.username 
                    WHERE v.candidateid = candidates.candidateid
                        AND v.pollid = positions.pollid
                ) as voters_grade'),
            )
            ->whereNotNull('positions.position_name')
            ->where('candidates.pollid', $request->info)
            ->orderBy('candidates.positionid', 'ASC')
            ->orderBy('candidates.votes', 'DESC')
            ->get();

            if($liveresult) {
                return response()->json([
                    'status' => 200,
                    'liveresult' => $liveresult,
                    'message' => 'Results has been retrieved!'
                ], 200);
            }   
            return response()->json([
                'message' => 'Something went Wrong!'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ]);
        }
    }

    public function archiveresult(Request $request) {
        try {
            $grades = Poll::select('participant_grade', DB::raw("YEAR(created_at) AS created_year"))->where('pollid', $request->info)->first();
            $currentYear = Carbon::now()->format('Y');

            if ($grades) {
                $gradesArray = explode(',', $grades->participant_grade);
                $totalparticipants = Student::whereIn('grade', $gradesArray)
                    // ->where('enrolled', 1)
                    ->where('year_enrolled', '<=', $grades->created_year)
                    ->where(function ($query) use ($currentYear) {
                        $query->whereNull('year_unenrolled')
                            ->orWhere('year_unenrolled', '')
                            ->orWhere('year_unenrolled', '>', $currentYear);
                    })
                    ->count();
                $participantslist = Student::select('username', 'name', 'grade',
                    DB::raw("IF(EXISTS(SELECT 1 FROM votes WHERE pollid = '$request->info' AND voterid = students.username),1,0) AS votestatus"),
                    DB::raw("(SELECT DATE_FORMAT(MAX(created_at), '%M %d, %Y %h:%i %p') FROM votes 
                            WHERE pollid = '$request->info' AND voterid = students.username) AS vote_date")
                    )
                    ->whereIn('grade', $gradesArray)
                    // ->where('enrolled', 1)
                    ->where('year_enrolled', '<=', $grades->created_year)
                    ->where(function ($query) use ($currentYear) {
                        $query->whereNull('year_unenrolled')
                            ->orWhere('year_unenrolled', '')
                            ->orWhere('year_unenrolled', '>', $currentYear);
                    })
                    ->orderBy('votestatus', 'DESC')
                    ->orderBy('vote_date', 'DESC')
                    ->get();
            } else {
                $totalparticipants = 0; // Handle the case where no grades are found
            }

            $currentvotes = Vote::where('pollid', $request->info)->distinct('voterid')->count();

            $liveresult = Candidate::leftJoin('students', 'candidates.candidateid', '=', 'students.username')
                ->leftJoin('positions', function($join) {
                    $join->on('candidates.positionid', '=', 'positions.positionid')
                        ->on('candidates.pollid', '=', 'positions.pollid');
                })
                ->select('candidates.candidateid', 'candidates.positionid', 'candidates.pollid', 
                    'positions.position_name', 'candidates.party', 'candidates.platform', 'candidates.status', 'candidates.votes',
                    DB::raw("CONCAT(positions.position_name, ': ', students.name) as label"),
                    DB::raw('(
                        SELECT 
                            CONCAT(COUNT(CASE WHEN s.gender = "M" THEN 1 END), 
                            ",", COUNT(CASE WHEN s.gender = "F" THEN 1 END)
                            )
                        FROM votes v
                        LEFT JOIN students s 
                            ON v.voterid = s.username 
                        WHERE v.candidateid = candidates.candidateid
                            AND v.pollid = positions.pollid
                    ) as voters_info'),
                    DB::raw('(
                        SELECT 
                            CONCAT(COUNT(CASE WHEN s.grade = "7" THEN 1 END), 
                            ",", COUNT(CASE WHEN s.grade = "8" THEN 1 END),
                            ",", COUNT(CASE WHEN s.grade = "9" THEN 1 END),
                            ",", COUNT(CASE WHEN s.grade = "10" THEN 1 END),
                            ",", COUNT(CASE WHEN s.grade = "11" THEN 1 END),
                            ",", COUNT(CASE WHEN s.grade = "12" THEN 1 END)
                            )
                        FROM votes v
                        LEFT JOIN students s 
                            ON v.voterid = s.username 
                        WHERE v.candidateid = candidates.candidateid
                            AND v.pollid = positions.pollid
                    ) as voters_grade'),
                )
                ->whereNotNull('positions.position_name')
                ->where('candidates.pollid', $request->info)
                ->orderBy('candidates.positionid', "ASC")
                ->orderBy('candidates.votes', "DESC")
                ->get();

            if($liveresult) {
                return response()->json([
                    'status' => 200,
                    'liveresult' => $liveresult,
                    'currentvotes' => $currentvotes,
                    'totalparticipants' => $totalparticipants,
                    'participantslist' => $participantslist,
                    'message' => 'Results has been retrieved!'
                ], 200);
            }   
            return response()->json([
                'message' => 'Something went Wrong!'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ]);
        }
    }

    public function votecandidates(Request $request) {
        $authUser = Auth::user();
        $currentYear = Carbon::now()->format('Y');

        $alreadyvote = false;
        $vote = Vote::where('pollid', $request->info)->where('voterid', $authUser->username)->count();

        if($vote > 0) $alreadyvote = true;

        $grades = Poll::select('participant_grade', DB::raw("YEAR(created_at) AS created_year"))->where('pollid', $request->info)->first();

        if ($grades) {
            $gradesArray = explode(',', $grades->participant_grade);
            $totalparticipants = Student::whereIn('grade', $gradesArray)
                    // ->where('enrolled', 1)
                    ->where('year_enrolled', '<=', $grades->created_year)
                    ->where(function ($query) use ($currentYear) {
                        $query->whereNull('year_unenrolled')
                            ->orWhere('year_unenrolled', '')
                            ->orWhere('year_unenrolled', '>', $currentYear);
                    })
                    ->count();
            $participantslist = Student::select('username', 'name', 'grade',
                DB::raw("IF(EXISTS(SELECT 1 FROM votes WHERE pollid = '$request->info' AND voterid = students.username),1,0) AS votestatus"),
                DB::raw("(SELECT DATE_FORMAT(MAX(created_at), '%M %d, %Y %h:%i %p') FROM votes 
                          WHERE pollid = '$request->info' AND voterid = students.username) AS vote_date")
                )
                ->whereIn('grade', $gradesArray)
                // ->where('enrolled', 1)
                ->where('year_enrolled', '<=', $grades->created_year)
                ->where(function ($query) use ($currentYear) {
                    $query->whereNull('year_unenrolled')
                        ->orWhere('year_unenrolled', '')
                        ->orWhere('year_unenrolled', '>', $currentYear);
                })
                ->orderBy('votestatus', 'DESC')
                ->orderBy('vote_date', 'DESC')
                ->get();
        

        } else {
            $totalparticipants = 0; // Handle the case where no grades are found
        }

        $currentvotes = Vote::where('pollid', $request->info)->distinct('voterid')->count();

        $applications = Position::select(
            'positions.positionid',
            'positions.position_name',
            DB::raw('IFNULL((
                SELECT GROUP_CONCAT(
                    CONCAT(
                        \'{"candidateid": "\', candidates.candidateid,
                        \'", "candidate_name": "\', candidates.candidate_name,
                        \'", "pollid": "\', candidates.pollid,
                        \'", "positionid": "\', candidates.positionid,
                        \'", "grade": "\', candidates.grade,
                        \'", "party": "\', candidates.party,
                        \'", "platform": "\', candidates.platform,
                        \'", "status": "\', candidates.status, 
                        \'"}\'
                    ) SEPARATOR \',\'
                )
                FROM candidates
                WHERE candidates.positionid = positions.positionid
                AND candidates.pollid = positions.pollid
                AND candidates.status = 1
            ), \'[]\') AS candidates')
        )
        ->where('positions.pollid', $request->info)
        ->groupBy('positions.positionid', 'positions.position_name', 'positions.pollid')
        ->get();

        if($applications) {
            return response()->json([
                'applications' => $applications,
                'alreadyvote' => $alreadyvote,
                'currentvotes' => $currentvotes,
                'totalparticipants' => $totalparticipants,
                'participantslist' => $participantslist,
                'message' => 'Vote Candidate List Retrieved!',
            ]);
        }   
        else {
            return response()->json([
                'applications' => $applications,
                'alreadyvote' => $alreadyvote,
                'currentvotes' => $currentvotes,
                'totalparticipants' => $totalparticipants,
                'participantslist' => $participantslist,
                'message' => 'No candidates found!'
            ]);
        }
    }

    public function submitvote(Request $request) {
        $authUser = Auth::user();

        if(!$request->pollid) {
            return response()->json([
                'message' => 'Invalid Election ID!'
            ]);
        }

        $alreadyvote = Vote::where('pollid', $request->pollid)->where('voterid', $authUser->username)->count();

        if($alreadyvote > 0) {
            return response()->json([
                'message' => 'You already vote!'
            ]);
        }
        $castvote = false;
        // Loop through each position in positionSelections
        foreach ($request->positionSelections as $key => $candidateid) {
            // Remove the word 'position' and retain only the numeric part as the positionid
            $positionid = str_replace('position', '', $key);

            if($positionid && $candidateid) {
                // Insert the vote into the database
                Vote::create([
                    'voterid' => $authUser->username,
                    'pollid' => strtoupper($request->pollid),
                    'positionid' => $positionid,  // Use the numeric part of the key as positionid
                    'candidateid' => $candidateid,  // Use the value as the candidateid
                    'created_by' => $authUser->username,
                    'updated_by' => $authUser->username,
                ]);

                Candidate::where('pollid', strtoupper($request->pollid))
                    ->where('positionid', $positionid)
                    ->where('candidateid', $candidateid)
                    ->increment('votes');
                    
                $castvote = true;
            }
        }

        if($castvote) {
            return response()->json([
                'status' => 200,
                'message' => 'Vote submitted successfully!'
            ], 200);
        }

        return response()->json([
            'message' => 'Please vote at least one of any candidates!'
        ]);
    }
    
}
