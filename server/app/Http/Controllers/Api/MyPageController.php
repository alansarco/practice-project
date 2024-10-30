<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MyPageController extends Controller
{
    public function index(Request $request) {
        $authUser = Auth::user();
        
        $application = Candidate::leftJoin('students', 'candidates.candidateid', '=', 'students.username')
            ->leftJoin('positions', function($join) {
                $join->on('candidates.positionid', '=', 'positions.positionid')
                    ->on('candidates.pollid', '=', 'positions.pollid');
            })
            ->leftJoin('polls', 'candidates.pollid', '=', 'polls.pollid')
            ->select('candidates.candidateid', 'candidates.positionid', 'candidates.pollid', 
                'positions.position_name', 'candidates.party', 'candidates.platform', 'candidates.status',
                'students.name', 'polls.pollname',
                DB::raw("DATE_FORMAT(candidates.created_at, '%M %d, %Y %h:%i %p') AS created_date")
            )
            ->whereNotNull('positions.position_name')
            ->where('candidates.candidateid', $authUser->username)
            ->get();
        
        $application = [
            'application' => $application
        ];

        if($application) {
            return response()->json([
                'application' => $application,
                'message' => 'Applications Retrieved!',
            ]);
        }   
        else {
            return response()->json([
                'application' => $application,
                'message' => 'No applications found!'
            ]);
        }
    }

    public function myvotes(Request $request) {
        $authUser = Auth::user();
        
        $myvotes = DB::table('polls')
        // Join polls with votes where pollid matches and voterid is the authenticated user
        ->join('votes', function ($join) use ($authUser) {
            $join->on('polls.pollid', '=', 'votes.pollid')
                 ->where('votes.voterid', '=', $authUser->username);
        })
        // Create a subquery to get candidate_name and position_name
        ->select(
            'polls.pollid',
            'polls.pollname',
            DB::raw('(
                SELECT 
                    GROUP_CONCAT(DISTINCT CONCAT(p.position_name, ": ", c.candidate_name) SEPARATOR "; ") 
                FROM votes v
                LEFT JOIN candidates c 
                    ON v.pollid = c.pollid 
                    AND v.candidateid = c.candidateid
                LEFT JOIN positions p 
                    ON v.pollid = p.pollid 
                    AND v.positionid = p.positionid
                WHERE v.pollid = polls.pollid
                    AND v.voterid = '.$authUser->username.'
            ) as myvotes'),
            DB::raw('DATE_FORMAT((
                SELECT MAX(v.created_at)
                FROM votes v
                WHERE v.pollid = polls.pollid
            ), "%M %d, %Y %h:%i %p") as last_vote_time')
        )
        ->distinct()
        // Get the results
        ->get();
        
        $myvotes = [
            'myvotes' => $myvotes
        ];

        if($myvotes) {
            return response()->json([
                'myvotes' => $myvotes,
                'message' => 'My Votes Retrieved!',
            ]);
        }   
        else {
            return response()->json([
                'myvotes' => $myvotes,
                'message' => 'No applications found!'
            ]);
        }
    }

}
