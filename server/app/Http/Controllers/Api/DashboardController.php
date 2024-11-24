<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Admin;
use App\Models\Election;
use App\Models\Calendar;
use App\Models\Poll;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use function PHPUnit\Framework\isNull;

class DashboardController extends Controller
{
    //returns data of Ither Statistics
    public function OtherStatistics() 
    {
        $currentYear = Carbon::now()->format('Y');
        $populationCount = [];
        
        for ($x = 0; $x <= 10; $x++) {
            $population = Student::where('year_enrolled', '<=', $currentYear)
                ->where(function ($query) use ($currentYear) {
                    $query->whereNull('year_unenrolled')
                        ->orWhere('year_unenrolled', '')
                        ->orWhere('year_unenrolled', '>=', $currentYear);
                })
                ->count();

            $populationCount[$currentYear] = $population;
            $currentYear--;
        }

        $currentYear1 = Carbon::now()->format('Y');
        $unenrollCount = [];
        
        for ($x = 0; $x <= 10; $x++) {
            $population = Student::where('year_unenrolled', '<=', $currentYear1)->count();

            $unenrollCount[$currentYear1] = $population;
            $currentYear1--;
        }

        $events = Calendar::select('id', 'event_name', 'event_date','description', 'time', 'event_date_end', 'color', 'time_end')
        ->get()
        ->map(function($event) {
            // Combine date and time to create a proper start and end timestamp
            $startDateTime = Carbon::parse($event->event_date . ' ' . $event->time);
            $endDateTime = Carbon::parse($event->event_date_end . ' ' . $event->time_end);
            $title = $event->event_name . ': ' . $event->description;
            
            return [
                'title' => $title,
                'start' => $startDateTime->toIso8601String(), // Format as ISO 8601 string
                'end' => $endDateTime->toIso8601String(),     // Format as ISO 8601 string
                'color' => $event->color,
            ];
        });

        $data0 = User::where('access_level', 999)->where('account_status', 1)->count();
        $data1 = User::where('access_level', 10)->where('account_status', 1)->count();
        $data2 = User::where('access_level', 5)->where('account_status', 1)->count();
        $data7 = Student::where('grade', 7)->where('enrolled', 1)->count();
        $data8 = Student::where('grade', 8)->where('enrolled', 1)->count();
        $data9 = Student::where('grade', 9)->where('enrolled', 1)->count();
        $data10 = Student::where('grade', 10)->where('enrolled', 1)->count();
        $data11 = Student::where('grade', 11)->where('enrolled', 1)->count();
        $data12 = Student::where('grade', 12)->where('enrolled', 1)->count();
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
            'data0' => $data0,
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
            'populationCount' => $populationCount,
            'unenrollCount' => $unenrollCount,
            'events' => $events,
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
            $participant_org = $userInfo->org_name;
            $isAdmin = is_null($participant) ? 1 : 0;
            $filter = $request->filter ?? '';
            
            $polls = DB::select('CALL GET_POLLS(?, ?, ?, ?)', [$isAdmin, $participant, $filter, $participant_org]);
            
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
