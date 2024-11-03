// React components
import { Checkbox, Grid, Icon, Select, Switch } from "@mui/material";
import FixedLoading from "components/General/FixedLoading";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftInput from "components/SoftInput";
import SoftTypography from "components/SoftTypography";
import { gradeSelect, enrollStatus, years, genderSelect, currentDate, trackSelect, programSelect, courseSelect, modalitySelect } from "components/General/Utils";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { messages } from "components/General/Messages";
import { useStateContext } from "context/ContextProvider";
import { passToErrorLogs, passToSuccessLogs  } from "components/Api/Gateway";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";
 
function Edit({USER, HandleRendering, UpdateLoading, ReloadTable }) {
      const currentFileName = "layouts/users/components/Edit/index.js";
      const [submitProfile, setSubmitProfile] = useState(false);
      const {token} = useStateContext();  

      const YOUR_ACCESS_TOKEN = token; 
      const headers = {
            'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
      };
      
      const initialState = {
            username: USER.username,
            name: USER.name,
            grade: USER.grade == null ? "" : USER.grade,
            section: USER.section == null ? "" : USER.section,
            program: USER.track == null ? "" : USER.program,
            track: USER.track == null ? "" : USER.track,
            course: USER.course == null ? "" : USER.course,
            gender: USER.gender == null ? "" : USER.gender,
            contact: USER.contact == null ? "" : USER.contact,
            email: USER.contact == null ? "" : USER.email,
            religion: USER.religion == null ? "" : USER.religion,
            modality: USER.modality == null ? "" : USER.modality,
            birthdate: USER.birthdate == null ? "" : USER.birthdate,
            house_no: USER.house_no == null ? "" : USER.house_no,
            barangay: USER.barangay == null ? "" : USER.barangay,
            municipality: USER.municipality == null ? "" : USER.municipality,
            province: USER.province == null ? "" : USER.province,
            father_name: USER.father_name == null ? "" : USER.father_name,
            mother_name: USER.mother_name == null ? "" : USER.mother_name,
            guardian: USER.guardian == null ? "" : USER.guardian,
            guardian_rel: USER.guardian_rel == null ? "" : USER.guardian_rel,
            contact_rel: USER.contact_rel == null ? "" : USER.contact_rel, 
            enrolled: USER.enrolled == null ? "" : USER.enrolled, 
            year_enrolled: USER.year_enrolled == null ? "" : USER.year_enrolled, 
            agreement: false,   
      };

      const [formData, setFormData] = useState(initialState);

      const handleChange = (e) => {
            const { name, value, type } = e.target;
            if (type === "checkbox") {
                  setFormData({ ...formData, [name]: !formData[name]});
            } else {
                  setFormData({ ...formData, [name]: value });
            }
      };

      const handleCancel = () => {
            HandleRendering(1);
            ReloadTable();
      };
            
      const handleSubmit = async (e) => {
            e.preventDefault(); 
            toast.dismiss();
             // Check if all required fields are empty
             const requiredFields = [
                  "username", 
                  "name", 
                  "grade",
                  "section",
                  "birthdate",
                  "gender",
                  "contact",
                  "email",
                  "modality",
                  "barangay",
                  "municipality",
                  "province",
                  "enrolled",
                  "year_enrolled",
            ];
            const emptyRequiredFields = requiredFields.filter(field => !formData[field]);

            if (emptyRequiredFields.length === 0) {
                  if(!formData.agreement) {
                        toast.warning(messages.agreement, { autoClose: true });
                  }
                  else if (formData.grade < 11 && formData.program == "") {
                        toast.warning("Please select program!", { autoClose: true });
                  }
                  else if(formData.grade > 10 && (formData.track == "" || formData.course == "")) {
                        toast.warning("Please select a track and course!", { autoClose: true });
                  }
                  else {      
                        setSubmitProfile(true);
                        try {
                              if (!token) {
                                    toast.error(messages.prohibit, { autoClose: true });
                              }
                              else {  
                                    const response = await axios.post(apiRoutes.accountUpdate, formData, {headers});
                                    if(response.data.status == 200) {
                                          toast.success(`${response.data.message}`, { autoClose: true });
                                    } else {
                                          toast.error(`${response.data.message}`, { autoClose: true });
                                    }
                                    UpdateLoading(true);
                                    passToSuccessLogs(response.data, currentFileName);
                              }
                        } catch (error) { 
                              toast.error(messages.updateUserError, { autoClose: true });
                              passToErrorLogs(error, currentFileName);
                        }     
                        setSubmitProfile(false);
                  }
                  
            } else {
                  // Display an error message or prevent form submission
                  toast.warning(messages.required, { autoClose: true });
            }
      };

      return (  
      <>
            {submitProfile && <FixedLoading />}   
            <SoftBox mt={5} mb={3} px={2}>      
                  <SoftBox mb={5} p={4} className="shadow-sm rounded-4 bg-white">
                        <SoftTypography fontWeight="medium" color="success" textGradient>
                              Direction!
                        </SoftTypography>
                        <SoftTypography fontWeight="bold" className="text-xs">
                              Please fill in the required fields. Rest assured that data is secured.     
                        </SoftTypography> 
                        <SoftBox mt={2}>
                              <SoftBox component="form" role="form" className="px-md-0 px-2" onSubmit={handleSubmit}>
                                    <SoftTypography fontWeight="medium" textTransform="capitalize" color="success" textGradient>
                                          Personal Information    
                                    </SoftTypography>
                                    <input type="hidden" name="username" value={formData.username} size="small" /> 
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} sm={6} md={4} px={1}>
                                                <SoftTypography variant="button" className="me-1">Fullname:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput name="name" value={formData.name.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>     
                                          <Grid item xs={12} sm={6} md={4} px={1}>
                                                <SoftTypography variant="button" className="me-1">Email:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput name="email" value={formData.email} onChange={handleChange} size="small"  type="email"/>  
                                          </Grid>     
                                          <Grid item xs={12} sm={6} lg={2} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Gender: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer" name="gender" value={formData.gender} onChange={handleChange} >
                                                      <option value=""></option>
                                                      {genderSelect && genderSelect.map((gender) => (
                                                      <option key={gender.value} value={gender.value}>
                                                            {gender.desc}
                                                      </option>
                                                      ))}
                                                </select>
                                          </Grid>
                                          <Grid item xs={12} sm={6} lg={2} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Grade Level: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer" name="grade" value={formData.grade} onChange={handleChange} >
                                                      <option value=""></option>
                                                      {gradeSelect && gradeSelect.map((grade) => (
                                                      <option key={grade.value} value={grade.value}>
                                                            {grade.desc}
                                                      </option>
                                                      ))}
                                                </select>
                                          </Grid>
                                          <Grid item xs={12} sm={6} md={4} px={1}>
                                                <SoftTypography variant="button" className="me-1">Section:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput name="section" value={formData.section.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>
                                          {formData.grade < 11 && formData.grade != '' &&
                                          <Grid item xs={12} sm={6} md={4} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Program: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer" name="program" value={formData.program} onChange={handleChange} >
                                                      <option value="">N/A</option>
                                                      {programSelect && programSelect.map((program) => (
                                                      <option key={program.value} value={program.value}>
                                                            {program.desc}
                                                      </option>
                                                      ))}
                                                </select>
                                          </Grid>
                                          }
                                          {formData.grade > 10 && formData.grade != '' &&
                                          <>
                                          <Grid item xs={12} sm={6} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Track: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer" name="track" value={formData.track} onChange={handleChange} >
                                                      <option value="">N/A</option>
                                                      {trackSelect && trackSelect.map((track) => (
                                                      <option key={track.value} value={track.value}>
                                                            {track.desc}
                                                      </option>
                                                      ))}
                                                </select>
                                          </Grid>
                                          <Grid item xs={12} sm={6} md={3} px={1}>   
                                                <SoftTypography variant="button" className="me-1"> Course: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer" name="course" value={formData.course} onChange={handleChange} >
                                                      <option value="">N/A</option>
                                                      {Array.from(new Set(courseSelect
                                                      .filter((course) => course.group === formData.track)
                                                      .map((course) => course.group)
                                                      )).map((group) => (
                                                      <optgroup key={group} label={group}>
                                                            {courseSelect
                                                            .filter((course) => course.group === group)
                                                            .map((course) => (
                                                            <option key={course.value} value={course.value}>
                                                                  {course.desc}
                                                            </option>
                                                            ))}
                                                      </optgroup>
                                                      ))}
                                                </select>
                                          </Grid>
                                          </>
                                          }
                                          <Grid item xs={12} sm={6} md={4} px={1}>
                                                <SoftTypography variant="button" className="me-1">Religion:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput name="religion" value={formData.religion.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>
                                          <Grid item xs={12} sm={6} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Contact Number: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput type="number" name="contact" value={formData.contact} onChange={handleChange} size="small" /> 
                                          </Grid> 
                                          <Grid item xs={12} sm={6} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Birthdate: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <input className="form-control form-control-sm text-secondary rounded-5"  max={currentDate} name="birthdate" value={formData.birthdate} onChange={handleChange} type="date" />
                                          </Grid>
                                          <Grid item xs={12} sm={6} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Learning Modality: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer" name="modality" value={formData.modality} onChange={handleChange} >
                                                      <option value="">N/A</option>
                                                      {modalitySelect && modalitySelect.map((modality) => (
                                                      <option key={modality.value} value={modality.value}>
                                                            {modality.desc}
                                                      </option>
                                                      ))}
                                                </select>
                                          </Grid>
                                          <Grid item xs={12} sm={6} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Currently Enrolled: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer" name="enrolled" value={formData.enrolled} onChange={handleChange} >
                                                      <option value=""></option>
                                                      {enrollStatus && enrollStatus.map((status) => (
                                                      <option key={status.value} value={status.value}>
                                                            {status.desc}
                                                      </option>
                                                      ))}
                                                </select>
                                          </Grid>
                                          {formData.enrolled != 0 &&
                                          <Grid item xs={12} sm={6} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Year Enrolled: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer" name="year_enrolled" value={formData.year_enrolled} onChange={handleChange} >
                                                      <option value=""></option>
                                                      {years && years.map((year) => (
                                                      <option key={year} value={year}>
                                                            {year}
                                                      </option>
                                                      ))}
                                                </select>
                                          </Grid>
                                          }
                                          
                                    </Grid>     
                                    <SoftTypography mt={3} fontWeight="medium" textTransform="capitalize" color="success" textGradient>
                                          Address Information
                                    </SoftTypography>
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} sm={4} md={2} px={1}>
                                                <SoftTypography variant="button" className="me-1"> House No:</SoftTypography>
                                                <SoftInput name="house_no" value={formData.house_no.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>
                                          <Grid item xs={12} sm={8} md={4} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Barangay: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput name="barangay" value={formData.barangay.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>    
                                          <Grid item xs={12} sm={6} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Municipality: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput name="municipality" value={formData.municipality.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid> 
                                          <Grid item xs={12} sm={6} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Province: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput name="province" value={formData.province.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid> 
                                    </Grid>
                                    <SoftTypography mt={3} fontWeight="medium" textTransform="capitalize" color="success" textGradient>
                                          Family & Emergency Contact Information
                                    </SoftTypography>
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} sm={6} md={4} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Father:</SoftTypography>
                                                <SoftInput name="father_name" value={formData.father_name.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>
                                          <Grid item xs={12} sm={6} md={4} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Mother: </SoftTypography>
                                                <SoftInput name="mother_name" value={formData.mother_name.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>    
                                          <Grid item xs={12} sm={6} md={4} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Guardian: </SoftTypography>
                                                <SoftInput name="guardian" value={formData.guardian.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid> 
                                          <Grid item xs={12} sm={6} md={4} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Relationship to Guardian: </SoftTypography>
                                                <SoftInput name="guardian_rel" value={formData.guardian_rel.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid> 
                                          <Grid item xs={12} sm={6} md={4} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Contact: </SoftTypography>
                                                <SoftInput type="number" name="contact_rel" value={formData.contact_rel} onChange={handleChange} size="small" /> 
                                          </Grid> 
                                    </Grid>
                                    <Grid mt={3} container spacing={0} alignItems="center">
                                          <Grid item xs={12} pl={1}>
                                                <Checkbox 
                                                      className={` ${formData.agreement ? '' : 'border-2 border-success'}`} 
                                                      name="agreement" 
                                                      checked={formData.agreement} 
                                                      onChange={handleChange} 
                                                />
                                                <SoftTypography variant="button" className="me-1 ms-2">Verify Data </SoftTypography>
                                                <SoftTypography variant="p" className="text-xxs text-secondary fst-italic">(Confirming that the information above are true and accurate) </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                          </Grid>
                                    </Grid>
                                    <Grid mt={3} container spacing={0} alignItems="center" justifyContent="end">
                                          <Grid item xs={12} sm={4} md={2} pl={1}>
                                                <SoftBox mt={2} display="flex" justifyContent="end">
                                                      <SoftButton onClick={handleCancel} className="mx-2 w-100 text-xxs px-3 rounded-pill" size="small" color="light">
                                                            Back
                                                      </SoftButton>
                                                </SoftBox>
                                          </Grid>
                                          <Grid item xs={12} sm={4} md={2} pl={1}>
                                                <SoftBox mt={2} display="flex" justifyContent="end">
                                                      <SoftButton variant="gradient" type="submit" className="mx-2 w-100 text-xxs px-3 rounded-pill" size="small" color="success">
                                                            Update
                                                      </SoftButton>
                                                </SoftBox>
                                          </Grid>
                                    </Grid>     
                              </SoftBox>
                        </SoftBox>
                  </SoftBox>
            </SoftBox>
      </>
      );
}

export default Edit;
