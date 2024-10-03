<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Suffix;
use Exception;

class SuffixController extends Controller
{
    public function index() {
        try {
            $suffix = Suffix::select("id", "title")->orderBy("id", "ASC")->get();

            if($suffix->count() > 0) {
                return response()->json([
                    'suffix' => $suffix,
                    'message' => 'Suffix retrieved!',
                ]);
            }
            else {
                return response()->json([
                    'message' => 'No suffix found!'
                ]);
            }
        }
        catch (Exception $e) {
            return response()->json([
                'status' => 404,
                'message' => $e->getMessage()
            ], 404);
        }
    }
}
