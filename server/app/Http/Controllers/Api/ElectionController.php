<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\App_Info;
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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class ElectionController extends Controller
{
    public function adminselect(Request $request) {
        $admins = User::leftJoin('admins', 'users.username', '=', 'admins.username')
                ->select('admins.username', 'admins.name', 'admins.organization')
                ->where('admins.organization', $request->organization)
                ->where('users.account_status', 1)
                ->where('users.role', 'ADMIN')
                ->where('users.access_level', 10)
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
                    'admins' => $admins,
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
                    'organization' => strtoupper($request->organization),
                    'strict_mode' => $request->strict_mode,
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
            'organization' => $request->organization,
            'strict_mode' => $request->strict_mode,
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

        //Get Requirements Link
        $requirements_link = App_Info::select('requirements_link')->first();
        
        //this will check if there is existing application under this user
        $application = Candidate::leftJoin('students', 'candidates.candidateid', '=', 'students.username')
            ->leftJoin('positions', function($join) {
                $join->on('candidates.positionid', '=', 'positions.positionid')
                    ->on('candidates.pollid', '=', 'positions.pollid');
            })
            ->select('candidates.candidateid', 'candidates.positionid', 'candidates.pollid', 
                'positions.position_name', 'candidates.party', 'candidates.platform', 'candidates.status',
                DB::raw("TO_BASE64(candidates.requirements) as requirements_base64"),
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
                'requirements_link' => $requirements_link->requirements_link,
                'message' => 'Application Retrieved!',
            ]);
        }   
        else {
            return response()->json([
                'application' => $application,
                'requirements_link' => $requirements_link->requirements_link,
                'otherapplication' => $otherapplication,
                'message' => 'No application found!'
            ]);
        }
    }

    public function downloadrequirements(Request $request) {
        $application = Candidate::where('candidateid', $request->candidateId)
            ->where('pollid', $request->pollid)
            ->first();
    
        if (!$application || !$application->requirements) {
            return response()->json(['message' => 'File not found'], 404);
        }
    
        $fileName = 'requirements.zip'; // Adjust the file name as needed
        return response()->stream(function () use ($application) {
            echo $application->requirements; // Output the file content
        }, 200, [
            'Content-Type' => 'application/zip',
            'Content-Disposition' => "attachment; filename=\"$fileName\"",
        ]);
    }

    public function sumbitapplication(Request $request) {
        $authUser = Student::select('name', 'username', 'grade', 'org_name')->where('username', Auth::user()->username)->first();

        $validator = Validator::make($request->all(), [
            'pollid' => 'required',
            'party' => 'required',
            'platform' => 'required',
            'requirements' => 'required|mimes:zip|max:10240', 
            'id_picture' => 'required|mimes:png|max:2048', 
        ]); 

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        } 

        // Process the validated data, like storing the file, etc.
        $requirementsData = null; // Initialize the variable to hold the file path
        if ($request->hasFile('requirements')) {
            $file = $request->file('requirements');
            $requirementsData = file_get_contents($file->getRealPath()); // Get the file content as a string
        }
        
        // Process the validated data, like storing the file, etc.
        $pictureData = null; // Initialize the variable to hold the file path
        if ($request->hasFile('id_picture')) {
            $file = $request->file('id_picture');
            $pictureData = file_get_contents($file->getRealPath()); // Get the file content as a string
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
                'organization' => $authUser->org_name,
                'party' => strtoupper($request->party),
                'grade' => strtoupper($authUser->grade),
                'platform' => $request->platform,
                'requirements' => $requirementsData,
                'id_picture' => $pictureData,
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
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        "candidateid", candidates.candidateid,
                        "candidate_name", candidates.candidate_name,
                        "pollid", candidates.pollid,
                        "positionid", candidates.positionid,
                        "grade", candidates.grade,
                        "party", candidates.party,
                        "organization", candidates.organization,
                        "id_picture", TO_BASE64(candidates.id_picture),
                        "platform", candidates.platform,
                        "status", candidates.status
                    )
                )
                FROM candidates
                WHERE candidates.positionid = positions.positionid
                AND candidates.pollid = positions.pollid
            ), \'[]\') AS candidates')
        )
        ->where('positions.pollid', $request->info)
        ->groupBy('positions.positionid', 'positions.position_name', 'positions.pollid')
        ->get();
        

        $grades = Poll::select('participant_grade', 'organization', 'strict_mode', DB::raw("YEAR(created_at) AS created_year"))->where('pollid', $request->info)->first();
        $currentYear = Carbon::now()->format('Y');

        if ($grades) {
            $gradesArray = explode(',', $grades->participant_grade);
            if($grades->strict_mode == 1) {
                $totalparticipants = Student::whereIn('grade', $gradesArray)
                    // ->where('enrolled', 1)
                    ->where('year_enrolled', '<=', $grades->created_year)
                    ->where('org_name', $grades->organization)
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
                    ->where('org_name', $grades->organization)
                    ->where('year_enrolled', '<=', $grades->created_year)
                    ->where(function ($query) use ($currentYear) {
                        $query->whereNull('year_unenrolled')
                            ->orWhere('year_unenrolled', '')
                            ->orWhere('year_unenrolled', '>', $currentYear);
                    })
                    ->orderBy('votestatus', 'DESC')
                    ->orderBy('vote_date', 'DESC')
                    ->get();
            }
            else {
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
            }
            
        } else {
            $totalparticipants = 0; // Handle the case where no grades are found
        }

        if($applications) {
            return response()->json([
                'applications' => $applications,
                'participantslist' => $participantslist,
                'totalparticipants' => $totalparticipants,
                'message' => 'Application List Retrieved!',
            ]);
        }   
        else {
            return response()->json([
                'applications' => $applications,
                'participantslist' => $participantslist,
                'totalparticipants' => $totalparticipants,
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
                $student = Student::where('username', $request->candidateid)->first();
                $pollinfo = Poll::where('pollid', $request->pollid)->first();

                if($student->contact) {
                    $number = $student->contact;
                    $message = "Hello $student->name! Your application for $pollinfo->pollname has been approved!";

                    Http::asForm()->post('https://semaphore.co/api/v4/messages', [
                        'apikey' => '191998cd60101ec1f81b319a063fb06a',
                        'number' => $number,
                        'message' => $message,
                        'sender_name' => 'SNHS',
                    ]);
                }

                return response()->json([
                    'status' => 200,
                    'message' => 'Application has been approved and SMS notification has been sent!'
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
                $student = Student::where('username', $request->candidateid)->first();
                $pollinfo = Poll::where('pollid', $request->pollid)->first();

                if($student->contact) {
                    $number = $student->contact;
                    $message = "Hello $student->name! Your application for $pollinfo->pollname has been rejected!";

                    Http::asForm()->post('https://semaphore.co/api/v4/messages', [
                        'apikey' => '191998cd60101ec1f81b319a063fb06a',
                        'number' => $number,
                        'message' => $message,
                        'sender_name' => 'SNHS',
                    ]);
                }
                return response()->json([
                    'status' => 200,
                    'message' => 'Application has been rejected and SMS notification has been sent!'
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
            ->where('candidates.status', 1)
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
            $grades = Poll::select('participant_grade', 'organization', 'strict_mode', DB::raw("YEAR(created_at) AS created_year"))->where('pollid', $request->info)->first();
            $currentYear = Carbon::now()->format('Y');

            if ($grades) {
                $gradesArray = explode(',', $grades->participant_grade);
                $totalparticipants = Student::whereIn('grade', $gradesArray)
                    ->join(DB::raw("(SELECT voterid, MAX(created_at) as vote_date FROM votes WHERE pollid = '{$request->info}' GROUP BY voterid) as votes"),
                        function ($join) {
                            $join->on('students.username', '=', 'votes.voterid');
                        }
                    )
                    // ->where('enrolled', 1)
                    ->where('year_enrolled', '<=', $grades->created_year)
                    ->where(function ($query) use ($currentYear) {
                        $query->whereNull('year_unenrolled')
                            ->orWhere('year_unenrolled', '')
                            ->orWhere('year_unenrolled', '>', $currentYear);
                    })
                    ->count();

                $participantslist = Student::select(
                        'students.username',
                        'students.name',
                        'students.grade',
                        DB::raw("1 AS votestatus"), // Since INNER JOIN ensures a match, votestatus is always 1
                        DB::raw("DATE_FORMAT(votes.vote_date, '%M %d, %Y %h:%i %p') AS vote_date")
                    )
                    ->join(DB::raw("(SELECT voterid, MAX(created_at) as vote_date FROM votes WHERE pollid = '{$request->info}' GROUP BY voterid) as votes"),
                        function ($join) {
                            $join->on('students.username', '=', 'votes.voterid');
                        }
                    )
                    ->whereIn('students.grade', $gradesArray)
                    ->where('students.year_enrolled', '<=', $grades->created_year)
                    ->where(function ($query) use ($currentYear) {
                        $query->whereNull('students.year_unenrolled')
                            ->orWhere('students.year_unenrolled', '')
                            ->orWhere('students.year_unenrolled', '>', $currentYear);
                    })
                    ->orderBy('vote_date', 'DESC')  // Sort by the latest vote date
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
                ->where('candidates.status', 1)
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

        $grades = Poll::select('participant_grade', 'organization', 'strict_mode', DB::raw("YEAR(created_at) AS created_year"))->where('pollid', $request->info)->first();

        if ($grades) {
            $gradesArray = explode(',', $grades->participant_grade);
            if($grades->strict_mode == 1) {
                $totalparticipants = Student::whereIn('grade', $gradesArray)
                    // ->where('enrolled', 1)
                    ->where('year_enrolled', '<=', $grades->created_year)
                    ->where('org_name', $grades->organization)
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
            }
            else {
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
            }
        } else {
            $totalparticipants = 0; // Handle the case where no grades are found
        }

        $currentvotes = Vote::where('pollid', $request->info)->distinct('voterid')->count();

        $applications = Position::select(
            'positions.positionid',
            'positions.position_name',
            DB::raw('IFNULL((
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        "candidateid", candidates.candidateid,
                        "candidate_name", candidates.candidate_name,
                        "pollid", candidates.pollid,
                        "positionid", candidates.positionid,
                        "grade", candidates.grade,
                        "party", candidates.party,
                        "platform", candidates.platform,
                        "status", candidates.status
                    )
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

    public function notifyvoters(Request $request) {
        $authUser = Auth::user();

        if(!$request->pollid) {
            return response()->json([
                'message' => 'Invalid Election ID!'
            ]);
        }

        $grades = Poll::select('*', DB::raw("YEAR(created_at) AS created_year"))->where('pollid', $request->pollid)->first();

        if ($grades) {
            $gradesArray = explode(',', $grades->participant_grade);
            // Step 1: Get distinct phone numbers of enrolled students
            $distinctNumbers = Student::select('students.contact')
            ->leftJoin('votes', function ($join) use ($request) {
                $join->on('students.username', '=', 'votes.voterid')
                    ->where('votes.pollid', $request->pollid);
            })
            ->whereNull('votes.id') // Exclude students who have already voted for the given poll
            ->whereIn('grade', $gradesArray)
            ->where('enrolled', 1)
            ->where('year_enrolled', '<=', $grades->created_year)
            ->distinct()
            ->pluck('contact');
        
            // Step 2: Filter valid phone numbers and normalize them to "639xxxxxxxxx" format
            $validNumbers = $distinctNumbers->filter(function ($number) {
            // Remove any spaces or special characters
            $number = preg_replace('/\D/', '', $number);

            // Check if it starts with "09" and convert to "639xxxxxxxxx"
            if (preg_match('/^09\d{9}$/', $number)) {
                return '63' . substr($number, 1);
            }
            // Check if it starts with "+639" or "639"
            elseif (preg_match('/^(\+639|639)\d{9}$/', $number)) {
                return preg_replace('/^\+/', '', $number); // Remove "+" if present
            }

            // If none of the formats match, return false (invalid)
            return false;
            });

            // Step 3: Convert the filtered numbers into a comma-separated string
            $numbers = $validNumbers->implode(',');

            // Step 4: Prepare the SMS message with event details
            $poll_name = strtoupper($request->poll_name);
            $voting_start = date('F j, Y', strtotime($request->voting_start)); // Format: November 10, 2024
            $voting_end = date('h:i A', strtotime($request->voting_end)); // Format: 10:30 AM

            $message = "Hello student! Election for $poll_name has started already!\n\n"
                . "Start: $voting_start\n"
                . "End: $voting_end\n"
                . "Don't miss it! \n\nPlease Disregard message when you voted already.";

            // Step 6: Send the message via Semaphore API if there are valid numbers
            if ($numbers) {
                $response = Http::asForm()->post('https://semaphore.co/api/v4/messages', [
                    'apikey' => '191998cd60101ec1f81b319a063fb06a',
                    'number' => $numbers,
                    'message' => $message,
                    'sender_name' => 'SNHS',
                ]);

                if ($response->successful()) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'Student voters are notified sucessfully!'
                    ], 200);
                } else {
                    return response()->json([
                        'status' => 500,
                        'message' => 'Notification sent, but may experience delay on receiving the message!'
                    ], 500);
                }
            } 
            return response()->json([
                'message' => 'No valid numbers of student!'
            ]);
        } 
        return response()->json([
            'message' => 'Error notifying students!'
        ]);
    }
    
}
