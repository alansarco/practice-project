<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class JuniorController extends Controller
{
    public function index(Request $request) {
        $filter = $request->filter ?? '';
        $hasSpecificGrade = $request->grade != '' ? 1 : 0;
        $grade = $request->grade ?? 0;
        $enrolled = $request->enrolled ?? '';
        $org_name = $request->org_name ?? '';

        // Call the stored procedure
        $users = DB::select('CALL GET_JUNIOR_STUDENTS(?, ?, ?, ?, ?)', [$filter, $grade, $hasSpecificGrade, $enrolled, $org_name]);

        // Convert the results into a collection
        $usersCollection = collect($users);

        // Set pagination variables
        $perPage = 50; // Number of items per page
        $currentPage = LengthAwarePaginator::resolveCurrentPage(); // Get the current page

        // Slice the collection to get the items for the current page
        $currentPageItems = $usersCollection->slice(($currentPage - 1) * $perPage, $perPage)->values();

        // Create a LengthAwarePaginator instance
        $paginatedUsers = new LengthAwarePaginator($currentPageItems, $usersCollection->count(), $perPage, $currentPage, [
            'path' => $request->url(), // Set the base URL for pagination links
            'query' => $request->query(), // Preserve query parameters in pagination links
        ]);

        // Return the response
        if ($paginatedUsers->count() > 0) {
            return response()->json([
                'status' => 200,
                'message' => 'Users retrieved!',
                'users' => $paginatedUsers
            ], 200);
        } else {
            return response()->json([
                'message' => 'No users found!',
                'users' => $paginatedUsers
            ]);
        }
    }

}
