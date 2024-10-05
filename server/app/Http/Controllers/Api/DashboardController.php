<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Docrequest;
use App\Models\Student;
use App\Models\Admin;
use App\Models\Election;
use App\Models\Calendar;
use App\Models\User;
use Illuminate\Support\Facades\DB;

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

    //returns counts of sales
    public function ProductDistribution() 
    {
        $sales = Election::select('projectid','title as product_name','budget as product_sale')
            ->orderBy('budget', 'DESC')
            ->limit(10)
            ->get();

        // $sales = Election::leftJoin('requests', 'elections.projectid', '=', 'requests.doctype')
        //     ->select(
        //         'elections.projectid',
        //         'elections.title as product_name',
        //         DB::raw('COALESCE(SUM(requests.sales), 0) as product_sale')
        //     )
        //     ->groupBy('elections.projectid', 'elections.title')
        //     ->get();

        return response()->json([
            'sales' => $sales
        ]);
    }
}
