// React components
import { Checkbox, Grid} from "@mui/material";
import FixedLoading from "components/General/FixedLoading";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftInput from "components/SoftInput";
import SoftTypography from "components/SoftTypography";
import { participantSelect, currentDate } from "components/General/Utils";
import { useState } from "react";
import { toast } from "react-toastify";
import { messages } from "components/General/Messages";
import { useStateContext } from "context/ContextProvider";
import { passToErrorLogs, passToSuccessLogs  } from "components/Api/Gateway";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";

function Add({HandleRendering}) {
      const currentFileName = "layouts/admins/components/Add/index.js";
      const [submitProfile, setSubmitProfile] = useState(false);
      const {token} = useStateContext();  

      const YOUR_ACCESS_TOKEN = token; 
      const headers = {
            'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
      };
        
      const initialState = {
            pollname: "",
            desciption: "",
            participant_grade: "",
            application_start: "",
            application_end: "",
            validation_end: "",
            voting_start: "",
            voting_end: "",
            qualifications: "",
            requirements: "",
            admin_id: "",
            position1: "",
            position2: "",
            position3: "",
            position4: "",
            position5: "",
            position6: "",
            position7: "",
            position8: "",
            position9: "",
            position10: "",
            position11: "",
            position12: "",
            position13: "",
            position14: "",
            position15: "",
            position16: "",
            position17: "",
            position18: "",
            position19: "",
            position20: "",
            position21: "",
            agreement: false,   
      };

      const [formData, setFormData] = useState(initialState);

      const handleChange = (e) => {
            const { name, value, type } = e.target;
        
            if (type === "checkbox") {
                  setFormData({ ...formData, [name]: !formData[name] });
            } else {
                  setFormData((prevData) => {
                  const updatedData = { ...prevData, [name]: value };
      
                  const applicationStart = new Date(updatedData.application_start);
                  const applicationEnd = new Date(updatedData.application_end);
                  const validationEnd = new Date(updatedData.validation_end);
                  const votingStart = new Date(updatedData.voting_start);
                  const votingEnd = new Date(updatedData.voting_end);
        
                    // Rule 1: Application start and end can be equal, but end must be greater than or equal to start
                  if (name === 'application_start' || name === 'application_end') {
                        if (applicationEnd < applicationStart) {
                              toast.dismiss();
                              toast.warning('Application End must be greater than or equal to Application Start.', { autoClose: true });
                              updatedData.application_end = ''; // Reset application_end if invalid
                        }
                  }
        
                    // Rule 2: Validation end must be greater than both application start and end
                  if (name === 'validation_end') {
                        if (validationEnd <= applicationEnd || validationEnd <= applicationStart) {
                              toast.dismiss();
                              toast.warning('Validation End must be greater than both Application Start and End.', { autoClose: true });
                              updatedData.validation_end = ''; // Reset validation_end if invalid
                        }
                  }
        
                    // Rule 3: Voting start and end can be equal, but end must be greater than start and greater than validation end
                  if (name === 'voting_start' || name === 'voting_end') {
                        if (votingEnd < votingStart) {
                              toast.dismiss();  
                              toast.warning('Voting End must be greater than or equal to Voting Start.', { autoClose: true });
                              updatedData.voting_end = ''; // Reset voting_end if invalid
                        } else if (votingEnd <= validationEnd) {
                              toast.dismiss();
                              toast.warning('Voting End must be greater than Validation End.', { autoClose: true });
                              updatedData.voting_end = ''; // Reset voting_end if invalid
                        }
                  }
        
                  return updatedData;
                });
            }
        };
        

      const handleCancel = () => {
            HandleRendering(1);
      };
            
      const handleSubmit = async (e) => {
            e.preventDefault(); 
            toast.dismiss();
            // Check if all required fields are empty
            const requiredFields = [
                  "pollname",
                  "desciption",
                  "participant_grade",
                  "application_start",
                  "application_end",
                  "validation_end",
                  "voting_start",
                  "voting_end",
                  "qualifications",
                  "requirements",
                  "admin_id",
            ];
            const emptyRequiredFields = requiredFields.filter(field => !formData[field]);

            if (emptyRequiredFields.length === 0) {
                  if(!formData.agreement) {
                        toast.warning(messages.agreement, { autoClose: true });
                  }
                  // else {      
                  //       setSubmitProfile(true);
                  //       try {
                  //             if (!token) {
                  //                   toast.error(messages.prohibit, { autoClose: true });
                  //             }
                  //             else {  
                  //                   const response = await axios.post(apiRoutes.addAdmin, formData, {headers});
                  //                   if(response.data.status == 200) {
                  //                         toast.success(`${response.data.message}`, { autoClose: true });
                  //                         setFormData(initialState);
                  //                   } else {
                  //                         toast.error(`${response.data.message}`, { autoClose: true });
                  //                   }
                  //                   passToSuccessLogs(response.data, currentFileName);
                  //             }
                  //       } catch (error) { 
                  //             toast.error(messages.addUserError, { autoClose: true });
                  //             passToErrorLogs(error, currentFileName);
                  //       }     
                  //       setSubmitProfile(false);
                  // }
                  
            } else {
                  // Display an error message or prevent form submission
                  toast.warning(messages.required, { autoClose: true });
            }
      };

      return (  
      <>
            {submitProfile && <FixedLoading />}   
            <SoftBox mt={5} mb={3} px={3}>      
                  <SoftBox mb={5} p={4} className="shadow-sm rounded-4 bg-white">
                        <SoftTypography fontWeight="medium" color="success" textGradient>
                              Direction!
                        </SoftTypography>
                        <SoftTypography fontWeight="bold" className="text-xs">
                              Please fill in the required fields. Rest assured that data is secured.     
                        </SoftTypography> 
                        <SoftTypography fontWeight="bold" className="text-xxs mt-2">
                              REMINDERS:    
                        </SoftTypography> 
                        <SoftTypography variant="p" className="text-xxs text-secondary span fst-italic">    
                              (Please read before filling up the form) 
                        </SoftTypography> 
                        <ul className="text-danger fw-bold">
                              <li className="text-xxs fst-italic">Election ID will be system generated</li>
                              <li className="text-xxs fst-italic">Election Name cannot be changed once saved to maintain data integrity</li>
                              <li className="text-xxs fst-italic">You can no longer update and delete election once Validation Date ended</li>
                              <li className="text-xxs fst-italic">Make sure to approve and finalize candidates before the Validation Date ended</li>
                              <li className="text-xxs fst-italic">Position are already in order. The first one has the highest rank</li>
                        </ul>

                        <SoftBox mt={2}>
                              <SoftBox component="form" role="form" className="px-md-0 px-2" onSubmit={handleSubmit}>
                                    <SoftTypography fontWeight="medium" textTransform="capitalize" color="success" textGradient>
                                          Election Information    
                                    </SoftTypography>
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} md={6} lg={3} px={1}>
                                                <SoftTypography variant="button" className="me-1">Election Name:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput name="pollname" value={formData.pollname.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>  
                                          <Grid item xs={12} md={6} lg={6} px={1}>
                                                <SoftTypography variant="button" className="me-1">Description:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput name="desciption" value={formData.desciption} onChange={handleChange} size="small" /> 
                                          </Grid>  
                                    </Grid> 
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} sm={6} md={4} lg={2} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Participants: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer" name="participant_grade" value={formData.participant_grade} onChange={handleChange} >
                                                      <option value=""></option>
                                                      {participantSelect && participantSelect.map((participant) => (
                                                      <option key={participant.value} value={participant.value}>
                                                            {participant.desc}
                                                      </option>
                                                      ))}
                                                </select>
                                          </Grid>
                                          <Grid item xs={12} sm={6} md={4} lg={4} px={1}>
                                                <SoftTypography variant="button" className="me-1 text-nowrap"> Assigned Admin: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer" name="admin_id" value={formData.admin_id} onChange={handleChange} >
                                                      <option value=""></option>
                                                      {participantSelect && participantSelect.map((participant) => (
                                                      <option key={participant.value} value={participant.value}>
                                                            {participant.desc}
                                                      </option>
                                                      ))}
                                                </select>
                                          </Grid>
                                    </Grid> 
                                    <Grid container spacing={0} >
                                          <Grid item xs={12} md={6} px={1}>
                                                <SoftTypography variant="button" className="me-1">Qualification/s:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography> 
                                                <textarea name="qualifications" value={formData.qualifications} onChange={handleChange} className="form-control" rows="4"></textarea>
                                          </Grid> 
                                          <Grid item xs={12} md={6} px={1}>
                                                <SoftTypography variant="button" className="me-1">Requirement/s:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <textarea name="requirements" value={formData.requirements} onChange={handleChange} className="form-control" rows="4"></textarea> 
                                          </Grid> 
                                    </Grid> 
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} sm={6} md={4} lg={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Application Start: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <input 
                                                      className="form-control form-control-sm text-secondary rounded-5"  
                                                      min={currentDate} 
                                                      name="application_start" 
                                                      value={formData.application_start || ''} 
                                                      onChange={handleChange} 
                                                      type="date" 
                                                />
                                          </Grid>
                                          <Grid item xs={12} sm={6} md={4} lg={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Application End: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <input 
                                                      className="form-control form-control-sm text-secondary rounded-5"  
                                                      min={formData.application_start} 
                                                      name="application_end" 
                                                      value={formData.application_end || ''} 
                                                      onChange={handleChange} 
                                                      type="date" 
                                                />
                                          </Grid>
                                    </Grid> 
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} sm={6} md={4} lg={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Validation End: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <input 
                                                      className="form-control form-control-sm text-secondary rounded-5"  
                                                      min={formData.application_end} 
                                                      name="validation_end" 
                                                      value={formData.validation_end || ''} 
                                                      onChange={handleChange} 
                                                      type="date" 
                                                />
                                          </Grid>
                                    </Grid> 
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} sm={6} md={4} lg={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Voting Start: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <input 
                                                      className="form-control form-control-sm text-secondary rounded-5"  
                                                      min={formData.validation_end} 
                                                      name="voting_start" 
                                                      value={formData.voting_start || ''} 
                                                      onChange={handleChange} 
                                                      type="date" 
                                                />
                                          </Grid>
                                          <Grid item xs={12} sm={6} md={4} lg={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Voting End: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <input 
                                                      className="form-control form-control-sm text-secondary rounded-5"  
                                                      min={formData.voting_start} 
                                                      name="voting_end" 
                                                      value={formData.voting_end || ''} 
                                                      onChange={handleChange} 
                                                      type="date" 
                                                />
                                          </Grid>
                                    </Grid> 
                                    <SoftTypography mt={2} fontWeight="medium" textTransform="capitalize" color="success" textGradient>
                                          Position Information    
                                    </SoftTypography>
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} md={6} lg={4} px={1}>
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 1:</SoftTypography>
                                                <SoftInput name="position1" value={formData.position1.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 2:</SoftTypography>
                                                <SoftInput name="position2" value={formData.position2.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 3:</SoftTypography>
                                                <SoftInput name="position3" value={formData.position3.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 4:</SoftTypography>
                                                <SoftInput name="position4" value={formData.position4.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 5:</SoftTypography>
                                                <SoftInput name="position5" value={formData.position5.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 6:</SoftTypography>
                                                <SoftInput name="position6" value={formData.position6.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 7:</SoftTypography>
                                                <SoftInput name="position7" value={formData.position7.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>  
                                          <Grid item xs={12} md={6} lg={4} px={1}>
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 8:</SoftTypography>
                                                <SoftInput name="position8" value={formData.position8.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 9:</SoftTypography>
                                                <SoftInput name="position9" value={formData.position9.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 10:</SoftTypography>
                                                <SoftInput name="position10" value={formData.position10.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 11:</SoftTypography>
                                                <SoftInput name="position11" value={formData.position11.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 12:</SoftTypography>
                                                <SoftInput name="position12" value={formData.position12.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 13:</SoftTypography>
                                                <SoftInput name="position13" value={formData.position13.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 14:</SoftTypography>
                                                <SoftInput name="position14" value={formData.position14.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>  
                                          <Grid item xs={12} md={6} lg={4} px={1}>
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 15:</SoftTypography>
                                                <SoftInput name="position15" value={formData.position15.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 16:</SoftTypography>
                                                <SoftInput name="position16" value={formData.position16.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 17:</SoftTypography>
                                                <SoftInput name="position17" value={formData.position17.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 18:</SoftTypography>
                                                <SoftInput name="position18" value={formData.position18.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 19:</SoftTypography>
                                                <SoftInput name="position19" value={formData.position19.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 20:</SoftTypography>
                                                <SoftInput name="position20" value={formData.position20.toUpperCase()} onChange={handleChange} size="small" /> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 21:</SoftTypography>
                                                <SoftInput name="position21" value={formData.position21.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>  
                                    </Grid> 
                                    <Grid mt={3} container spacing={0} alignItems="center">
                                          <Grid item xs={12} pl={1}>
                                                <Checkbox name="agreement" checked={formData.agreement} onChange={handleChange} />
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
                                                            Save
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

export default Add;
