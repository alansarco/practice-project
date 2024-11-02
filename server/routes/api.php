<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\UsersController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GeneralController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ElectionController;
use App\Http\Controllers\Api\SignupController;
use App\Http\Controllers\Api\JuniorController;
use App\Http\Controllers\Api\MyPageController;
use App\Http\Controllers\Api\SeniorController;
use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
Route::post('login', [LoginController::class, 'login']);
Route::post('setpermanentpassword', [LoginController::class, 'setpermanentpassword']);
Route::get('app_info', [GeneralController::class, 'app_info']);
Route::get('signupsuffix', [SignupController::class, 'signupsuffix']);
Route::post('signupuser', [SignupController::class, 'signupuser']);
Route::post('createotp', [SignupController::class, 'createotp']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [LoginController::class, 'user']);
    Route::get('logout', [LoginController::class, 'logout']);

    Route::prefix('dashboard')->group(function () {
        Route::get('otherStats', [DashboardController::class, 'OtherStatistics']);
        Route::get('polls', [DashboardController::class, 'ElectionDistribution']);
    });

    Route::prefix('admins')->group(function () {
        Route::get('/', [AdminController::class, 'index']);
        Route::get('retrieve', [AdminController::class, 'retrieve']);
        Route::post('update', [AdminController::class, 'update']);
        Route::post('addadmin', [AdminController::class, 'addadmin']);
        Route::get('deleteadmin', [AdminController::class, 'deleteadmin']);
    });

    Route::prefix('applications')->group(function () {
        Route::get('adminselect', [ElectionController::class, 'adminselect']);
    });    

    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('changepass', [UserController::class, 'changepass']);
        Route::post('personalchangepass', [UserController::class, 'personalchangepass']);
        Route::get('deleteuser', [UserController::class, 'deleteuser']);
        Route::post('adduser', [UserController::class, 'adduser']);
        Route::get('userselect', [UserController::class, 'userselect']);
        Route::post('uploadexcel', [UserController::class, 'uploadexcel']);

    });

    Route::prefix('accounts')->group(function () {
        Route::get('/', [UsersController::class, 'index']);
        Route::post('store', [UsersController::class, 'store']);
        Route::post('update', [UsersController::class, 'update']);
        Route::get('retrieve', [UsersController::class, 'retrieve']);
        Route::get('delete', [UsersController::class, 'delete']);
        Route::post('addstudent', [UsersController::class, 'addstudent']);
    });

    Route::prefix('juniors')->group(function () {
        Route::post('/', [JuniorController::class, 'index']);

    });

    Route::prefix('seniors')->group(function () {
        Route::post('/', [SeniorController::class, 'index']);

    });

    Route::prefix('announcements')->group(function () {
        Route::get('/', [AnnouncementController::class, 'index']);
        Route::get('retrieve', [AnnouncementController::class, 'retrieve']);
        Route::post('addannouncement', [AnnouncementController::class, 'addannouncement']);
        Route::post('updateannouncement', [AnnouncementController::class, 'updateannouncement']);
        Route::get('deleteannouncement', [AnnouncementController::class, 'deleteannouncement']);

    });

    Route::prefix('elections')->group(function () {
        Route::get('/', [ElectionController::class, 'index']);
        Route::get('captainselect', [ElectionController::class, 'captainselect']);
        Route::post('addelection', [ElectionController::class, 'addelection']);
        Route::get('electioninfo', [ElectionController::class, 'electioninfo']);
        Route::get('deleteelection', [ElectionController::class, 'deleteelection']);
        Route::post('editupcoming', [ElectionController::class, 'editupcoming']);
        Route::post('editongoing', [ElectionController::class, 'editongoing']);
        Route::post('editapplication', [ElectionController::class, 'editapplication']);
        Route::get('positionselect', [ElectionController::class, 'positionselect']);
        Route::get('checkifapplied', [ElectionController::class, 'checkifapplied']);
        Route::post('sumbitapplication', [ElectionController::class, 'sumbitapplication']);
        Route::get('deleteapplication', [ElectionController::class, 'deleteapplication']);
        Route::get('viewapplications', [ElectionController::class, 'viewapplications']);
        Route::get('approveapplication', [ElectionController::class, 'approveapplication']);
        Route::get('rejectapplication', [ElectionController::class, 'rejectapplication']);
        Route::get('liveresult', [ElectionController::class, 'liveresult']);
        Route::get('archiveresult', [ElectionController::class, 'archiveresult']);
        Route::get('votecandidates', [ElectionController::class, 'votecandidates']);
        Route::post('submitvote', [ElectionController::class, 'submitvote']);
        Route::post('myvotes', [ElectionController::class, 'myvotes']);
        Route::get('downloadrequirements', [ElectionController::class, 'downloadrequirements']);
    });

    Route::prefix('mypages')->group(function () {
        Route::get('/', [MyPageController::class, 'index']);
        Route::get('myvotes', [MyPageController::class, 'myvotes']);

    });

    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingsController::class, 'index']);
        Route::post('updatesettings', [SettingsController::class, 'updatesettings']);
    });


});