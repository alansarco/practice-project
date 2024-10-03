<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\App_Info;
use App\Http\Controllers\AESCipher;
use Carbon\Carbon;
use Exception;

class GeneralController extends Controller {

    protected $aes;
    public function __construct() {
        $this->aes = new AESCipher;
    }

    public function app_info() {
        try {
            $currentDate = Carbon::now();

            $app_info = App_info::where('subscription', 1)  
            ->where('expires_at', '>', $currentDate)
            ->whereNotNull('starts_at')
            ->first();

            if($app_info) {
                return response()->json([
                    'app_info' => $app_info,
                    'status' => 1,
                    'message' => "System is now up and ready!"
                ]);
            }
            return response()->json([
                'message' => "App no longer registered, or subscription already expired!",
                'status' => 0,
            ]);
        }
        catch (Exception $e) {
            return response()->json([
                'status' => 404,
                'message' => $e->getMessage()
            ], 404);
        }
    }
}
