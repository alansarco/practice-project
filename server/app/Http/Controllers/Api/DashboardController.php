<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Docrequest;
use App\Models\Student;
use App\Models\Admin;
use App\Models\Election;
use App\Models\Calendar;
use App\Models\Poll;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use function PHPUnit\Framework\isNull;

class DashboardController extends Controller
{
    //returns data of Ither Statistics
    public function OtherStatistics() 
    {
        $data1 = User::where('role', "ADMIN")->where('account_status', 1)->count();
        $data2 = User::where('role', "USER")->where('account_status', 1)->count();
        $data7 = Student::where('grade', 7)->count();
        $data8 = Student::where('grade', 8)->count();
        $data9 = Student::where('grade', 9)->count();
        $data10 = Student::where('grade', 10)->count();
        $data11 = Student::where('grade', 11)->count();
        $data12 = Student::where('grade', 12)->count();
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

        $otherStats = [
            'data1' => $data1,
            'data2' => $data2,
            'data7' => $data7,
            'data8' => $data8,
            'data9' => $data9,
            'data10' => $data10,
            'data11' => $data11,
            'data12' => $data12,
            'upcomingevents' => $upcomingevents,
            'pastevents' => $pastevents,
        ];

        return response()->json([
            'otherStats' => $otherStats,
        ]);
    }

    //returns counts of polls
    public function ElectionDistribution(Request $request) 
    {
        $authUser = Auth::user();
        $role = $authUser->role == "ADMIN" ? "admins" : "students";

        $userInfo = User::leftJoin($role, 'users.username', '=', $role.'.username')
            ->select(
                $role.'.*', 
                'users.password', 
                $role.'.name as fullname',
                DB::raw("DATE_FORMAT(users.last_online, '%M %d, %Y') as last_online")
            )
            ->where('users.username', $authUser->username)
            ->first();

        if($userInfo) {
            $participant = $userInfo->grade;
            $isAdmin = is_null($participant) ? 1 : 0;
            $filter = $request->filter ?? '';
            
            $polls = DB::select('CALL GET_POLLS(?, ?, ?)', [$isAdmin, $participant, $filter]);
            
            return response()->json([
                'message' => 'Elections retrieved!',
                'polls' => $polls,
            ]);
        }
        return response()->json([
            'message' => "No Active elections!"
        ]);
    }
}
