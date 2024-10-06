<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class SeniorController extends Controller
{
    public function index(Request $request) {
        $filter = $request->filter ?? '';
        $hasSpecificGrade = $request->grade != '' ? 1 : 0;
        $grade = $request->grade ?? 0;     
        $track = $request->track ?? ''; 
        $course = $request->course ?? ''; 

        // Call the stored procedure
        $students = DB::select('CALL GET_SENIOR_STUDENTS(?, ?, ?, ?, ?)', [$filter, $track, $course, $grade, $hasSpecificGrade]);

        // Convert results into a collection
        $studentsCollection = collect($students);

        // Set pagination variables
        $perPage = 3; // Number of items per page
        $currentPage = LengthAwarePaginator::resolveCurrentPage(); // Get the current page

        // Slice the collection to get the items for the current page
        $currentPageItems = $studentsCollection->slice(($currentPage - 1) * $perPage, $perPage)->values();

        // Create a LengthAwarePaginator instance
        $paginatedStudents = new LengthAwarePaginator($currentPageItems, $studentsCollection->count(), $perPage, $currentPage, [
            'path' => $request->url(), // Set the base URL for pagination links
            'query' => $request->query(), // Preserve query parameters in pagination links
        ]);

        // Return the response
        if ($paginatedStudents->count() > 0) {
            return response()->json([
                'status' => 200,
                'message' => 'Users retrieved!',
                'users' => $paginatedStudents
            ], 200);
        } else {
            return response()->json([
                'message' => 'No users found!',
                'users' => $paginatedStudents
            ]);
        }
    }

}
