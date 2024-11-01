<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\App_Info;
use App\Models\Student;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Box\Spout\Reader\Common\Creator\ReaderEntityFactory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Exception;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    //Admin changing students pasword
    public function changepass(Request $request) {
        $authUser = Auth::user();

        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }
        
        $verify_code = App_Info::select("security_code")->first();

        if($verify_code->security_code != $request->security_code) {
            return response()->json([
                'message' => 'Sorry, the security code provided is invalid!'
            ]);
        }

        $validator = Validator::make($request->all(), [
            'security_code' => 'required',
            'newpass' => 'required',
            'confirmpass' => 'required',
        ]);

        $pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/';
        if(!preg_match($pattern, $request->newpass)) {
            return response()->json([
                'message' => 'Password must contain capital and small letter, number, and special character!'
            ]);    
        }

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }
        
        else {
            $user = User::where('username', $request->username)->first();
            if($user) {
                try {
                    if($request->newpass !== $request->confirmpass) {
                        return response()->json([
                            'message' => 'Password did not match!'
                        ]);        
                    }

                    $hashedPassword = Hash::make($request->newpass);
                    $update = User::where('username', $request->username)->update([ 'password' => $hashedPassword]);
                    if($update) {   
                        return response()->json([
                            'status' => 200,
                            'message' => 'Password changed!'
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
            } else {
                return response()->json([
                    'message' => 'This resident has no active account, Go to Accounts then add.'
                ]);
            }

        }
    }

    // Change your password
    public function personalchangepass(Request $request) {
        $authUser = Auth::user();

        $pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/';
        if(!preg_match($pattern, $request->newpass)) {
            return response()->json([
                'message' => 'Password must contain capital and small letter, number, and special character!'
            ]);    
        }

        $validator = Validator::make($request->all(), [
            'newpass' => 'required',
            'confirmpass' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }
        
        else {
            $user = User::where('username', $authUser->username)->first();
            if($user) {
                try {
                    if($request->newpass !== $request->confirmpass) {
                        return response()->json([
                            'message' => 'Password did not match!'
                        ]);        
                    }
                    if($request->password === $request->confirmpass) {
                        return response()->json([
                            'message' => 'Old and new password is the same!'
                        ]);
                    }
                    $hashedPassword = Hash::make($request->newpass);
                    $update = User::where('username', $authUser->username)->update([ 'password' => $hashedPassword]);
                    if($update) {   
                        return response()->json([
                            'status' => 200,
                            'message' => 'Password changed!'
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
            } else {
                return response()->json([
                    'message' => 'Something went wrong!'
                ]);
            }

        }
    }

    public function deleteuser(Request $request) {
        $authUser = Auth::user();

        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }

        $user = User::where('username', $request->username)->first();
        if($user) {
            try {
                $delete = User::where('username', $request->username)->delete();
                if($delete) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'Standard account deleted successfully!'
                    ], 200);  
                } else {
                    return response()->json([
                        'message' => 'Something went wrong!'
                    ]);
                }
            } catch (Exception $e) {
                return response()->json([
                    'message' => $e->getMessage()
                ]);
            }
        } else {
            return response()->json([
                'message' => 'Standard account not found!'
            ]);
        }
    }

    public function adduser(Request $request) {
        $authUser = Auth::user();

        $validator = Validator::make($request->all(), [
            'username' => 'required',
            'password' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]); 
        }

        else {
            $resident = DB::table('users')->where('username', $request->username)->first();
            if($resident) {
                $hashedPassword = Hash::make($request->newpass);
                $update = DB::table('users')->where('username', $request->username)->update([ 
                    'role' => 'RESIDENT',
                    'password' => $hashedPassword,
                    'deleted_at' => NULL,
                    'access_level' => 5,
                ]);
                if($update) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'Standard account added successfully!'
                    ], 200);
                }
                return response()->json([
                    'message' => 'Something went wrong!'
                ]);
            }
            else {
                try {
                    $add = User::create([
                        'username' => $request->username,
                        'password' => $request->password,
                        'access_level' => 5,
                        'created_by' => $authUser->username
                    ]);
        
                    if($add) {
                        return response()->json([
                            'status' => 200,
                            'message' => 'Standard account added successfully!'
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
    }

    public function uploadexcel(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'data' => 'required|file|mimes:xlsx,xls|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }

        $path = $request->file('data')->store('uploads');
        $fullPath = storage_path('app/' . $path);
        $reader = ReaderEntityFactory::createReaderFromFile(storage_path('app/' . $path));
        $reader->open(storage_path('app/' . $path));

        DB::beginTransaction(); // Begin a transaction
        $firstRow = true;

        try {
            foreach ($reader->getSheetIterator() as $sheet) {
                foreach ($sheet->getRowIterator() as $row) {
                    if ($firstRow) {
                        $firstRow = false; // Skip the first row (header)
                        continue;
                    }

                    $cells = $row->getCells();
                    if (isset($cells[0])) {
                        $username = $cells[0]->getValue();
                        $name = $cells[1]->getValue();
                        $contact = $cells[2]->getValue();
                        $gender = $cells[3]->getValue();
                        $birthdate = $cells[4]->getValue();
                        $grade = $cells[5]->getValue();
                        $section = $cells[6]->getValue();
                        $program = $cells[7]->getValue();
                        $track = $cells[8]->getValue();
                        $course = $cells[9]->getValue();
                        $religion = $cells[10]->getValue();
                        $house_no = $cells[11]->getValue();
                        $barangay = $cells[12]->getValue();
                        $municipality = $cells[13]->getValue();
                        $province = $cells[14]->getValue();
                        $father_name = $cells[15]->getValue();
                        $mother_name = $cells[16]->getValue();
                        $guardian = $cells[17]->getValue();
                        $guardian_rel = $cells[18]->getValue();
                        $contact_rel = $cells[19]->getValue();
                        $enrolled = $cells[20]->getValue();
                        $year_enrolled = $cells[21]->getValue();
                        $modality = $cells[22]->getValue();

                        // Validation
                        if ($grade < 11) {
                            $track = null;
                            $course = null;
                        }

                        if ($grade > 10) {
                            $program = null;
                        }

                        if(!$year_enrolled) {
                            $year_enrolled = date('Y');
                        }
                        

                        // Custom validations
                        if (!is_numeric($username) || strlen($username) != 12) {
                            throw new \Exception("Invalid LRN: $username");
                        }
                        if (!is_numeric($contact)) {
                            throw new \Exception("Invalid contact of LRN $username: $contact");
                        }
                        if (!in_array($gender, ['M', 'F'])) {
                            throw new \Exception("Invalid gender of LRN $username: $gender");
                        }
                        if (!preg_match('/\d{4}-\d{2}-\d{2}/', $birthdate)) {
                            throw new \Exception("Invalid birthdate format of LRN $username: $birthdate");
                        }
                        if ($grade < 7 || $grade > 12) {
                            throw new \Exception("Invalid grade of LRN $username: $grade");
                        }
                        if (!in_array($enrolled, [0, 1])) {
                            throw new \Exception("Invalid enrolled value  of LRN $username: $enrolled");
                        }
                        if (!preg_match('/^\d{4}$/', $year_enrolled)) {
                            throw new \Exception("Invalid year enrolled  of LRN $username: $year_enrolled");
                        }

                        
                        // Update or create student record
                        Student::updateOrCreate(
                            ['username' => $username],
                            [
                                'name' => strtoupper($name),
                                'contact' => $contact,
                                'gender' => strtoupper($gender),
                                'birthdate' => $birthdate,
                                'grade' => $grade,
                                'section' => strtoupper($section),
                                'program' => strtoupper($program),
                                'track' => strtoupper($track),
                                'course' => strtoupper($course),
                                'religion' => $religion,
                                'house_no' => $house_no,
                                'barangay' => strtoupper($barangay),
                                'municipality' => strtoupper($municipality),
                                'province' => strtoupper($province),
                                'father_name' => strtoupper($father_name),
                                'mother_name' => strtoupper($mother_name),
                                'guardian' => strtoupper($guardian),
                                'guardian_rel' => $guardian_rel,
                                'contact_rel' => $contact_rel,
                                'enrolled' => $enrolled,
                                'year_enrolled' => $year_enrolled,
                                'modality' => $modality,
                            ]
                        );
                    }
                }
            }

            DB::commit(); // Commit transaction if all rows pass validation
            $reader->close();
            // Remove soft-deleted duplicates for `username`
            DB::table('students')
                ->select('username')
                ->whereNotNull('deleted_at')
                ->groupBy('username')
                ->havingRaw('COUNT(username) > 1')
                ->pluck('username')
                ->each(function ($username) {
                    Student::where('username', $username)
                        ->whereNotNull('deleted_at')
                        ->forceDelete(); // Permanently delete soft-deleted duplicates
                });
            
                sleep(1);

                // Try deleting with Storage, and if it fails, use unlink
                try {
                    Storage::delete($path) || unlink($fullPath);
                } catch (\Exception $e) {
                    // Handle deletion error
                    return response()->json(['status' => 500, 'message' => 'Failed to delete uploaded file: ' . $e->getMessage()]);
                }

            return response()->json(['status' => 200, 'message' => 'Students data uploaded successfully!']);

        } catch (\Exception $e) {
            DB::rollBack(); // Rollback transaction if any error occurs
            $reader->close();

            // Delay to ensure file handlers are released
            sleep(1);

            // Try deleting with Storage, and if it fails, use unlink
            try {
                Storage::delete($path) || unlink($fullPath);
            } catch (\Exception $e) {
                // Handle deletion error
                return response()->json(['status' => 500, 'message' => 'Failed to delete uploaded file: ' . $e->getMessage()]);
            }

            return response()->json(['status' => 500, 'message' => 'Failed to upload data: ' . $e->getMessage()]);
        }
    }

}
