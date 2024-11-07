<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\App_Info;
use App\Models\Student;
use App\Models\StudentUpload;
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
        $authUser = Admin::select('name')->where('username',  Auth::user()->username)->first();

        $validator = Validator::make($request->all(), [
            'data' => 'required|file|mimes:xlsx,xls|max:20000',
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
            Student::where('enrolled', 1)
                ->update([
                    'enrolled' => 0,
                    'year_unenrolled' => date('Y'),
                ]);

            foreach ($reader->getSheetIterator() as $sheet) {
                $rowNumber = 1;
                foreach ($sheet->getRowIterator() as $row) {
                    if ($firstRow) {
                        $firstRow = false; // Skip the first row (header)
                        continue;
                    }
                    $rowNumber++; // Increment row number for each data row

                    $cells = $row->getCells();
                                    
                    if (!empty($cells[0])) {
                        $username = isset($cells[0]) ? $cells[0]->getValue() : null;
                        $name = isset($cells[1]) ? $cells[1]->getValue() : null;
                        $contact = isset($cells[2]) ? $cells[2]->getValue() : null;
                        $email = isset($cells[3]) ? $cells[3]->getValue() : null;
                        $gender = isset($cells[4]) ? $cells[4]->getValue() : null;
                        $birthdate = isset($cells[5]) ? $cells[5]->getValue() : null;
                        $grade = isset($cells[6]) ? $cells[6]->getValue() : null;
                        $section = isset($cells[7]) ? $cells[7]->getValue() : null;
                        $program = isset($cells[8]) ? $cells[8]->getValue() : null;
                        $track = isset($cells[9]) ? $cells[9]->getValue() : null;
                        $course = isset($cells[10]) ? $cells[10]->getValue() : null;
                        $religion = isset($cells[11]) ? $cells[11]->getValue() : '';
                        $house_no = isset($cells[12]) ? $cells[12]->getValue() : '';
                        $barangay = isset($cells[13]) ? $cells[13]->getValue() : null;
                        $municipality = isset($cells[14]) ? $cells[14]->getValue() : null;
                        $province = isset($cells[15]) ? $cells[15]->getValue() : null;
                        $father_name = isset($cells[16]) ? $cells[16]->getValue() : '';
                        $mother_name = isset($cells[17]) ? $cells[17]->getValue() : '';
                        $guardian = isset($cells[18]) ? $cells[18]->getValue() : '';
                        $guardian_rel = isset($cells[19]) ? $cells[19]->getValue() : '';
                        $contact_rel = isset($cells[20]) ? $cells[20]->getValue() : '';
                        $year_enrolled = isset($cells[21]) ? $cells[21]->getValue() : null;
                        $modality = isset($cells[22]) ? $cells[22]->getValue() : '';

                        // Validation
                        if ($grade < 11) {
                            $track = '';
                            $course = '';
                        }

                        if ($grade > 10) {
                            $program = '';
                        }

                        if (!$year_enrolled) {
                            $year_enrolled = date('Y');
                        }

                        // Custom validations
                        if (!is_numeric($username) || strlen($username) != 12) {
                            throw new \Exception("Row $rowNumber: Invalid LRN $username");
                        }
                        if (!is_numeric($contact)) {
                            throw new \Exception("Row $rowNumber: Invalid contact for LRN $username - $contact");
                        }
                        if (!in_array($gender, ['M', 'F'])) {
                            throw new \Exception("Row $rowNumber: Invalid gender for LRN $username - $gender");
                        }
                        if (!preg_match('/\d{4}-\d{2}-\d{2}/', $birthdate)) {
                            throw new \Exception("Row $rowNumber: Invalid birthdate format for LRN $username - $birthdate");
                        }
                        if ($grade < 7 || $grade > 12) {
                            throw new \Exception("Row $rowNumber: Invalid grade for LRN $username - $grade");
                        }
                        if (!preg_match('/^\d{4}$/', $year_enrolled)) {
                            throw new \Exception("Row $rowNumber: Invalid year enrolled for LRN $username - $year_enrolled");
                        }

                        // Update or create student record
                        StudentUpload::updateOrCreate(
                            ['username' => $username],
                            [
                                'name' => strtoupper($name),
                                'contact' => $contact,
                                'email' => $email,
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
                                'enrolled' => 1,
                                'year_enrolled' => $year_enrolled,
                                'modality' => $modality,
                                'deleted_at' => null,
                                'created_by' => "Uploaded by " . $authUser->name,
                                'updated_by' => "Uploaded by " . $authUser->name,
                            ]
                        );
                    }
                }
            }

            DB::commit(); // Commit transaction if all rows pass validation
            $reader->close();

            sleep(1);
            
            // Try deleting with Storage, and if it fails, use unlink
            try {
                Storage::delete($path) || unlink($fullPath);
            } catch (\Exception $e) {
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
                return response()->json(['status' => 500, 'message' => 'Failed to delete uploaded file: ' . $e->getMessage()]);
            }

            return response()->json(['status' => 500, 'message' => 'Failed to upload data due to error in row ' . $rowNumber . ': ' . $e->getMessage()]);
        }
    }


}
