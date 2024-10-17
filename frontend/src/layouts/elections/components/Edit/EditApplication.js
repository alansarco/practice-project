// React components
import { Checkbox, Grid} from "@mui/material";
import FixedLoading from "components/General/FixedLoading";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftInput from "components/SoftInput";
import SoftTypography from "components/SoftTypography";
import { participantSelect, currentDate } from "components/General/Utils";
import { toast } from "react-toastify";
import { messages } from "components/General/Messages";
import { useStateContext } from "context/ContextProvider";
import { passToErrorLogs, passToSuccessLogs  } from "components/Api/Gateway";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";
import { useEffect, useState } from "react";
import VotingDateValidation from "components/General/VotingDateValidation";

function EditApplication({FROM, POLL, POSITIONS, HandleRendering, UpdateLoading}) {
      const currentFileName = "layouts/admins/components/Add/index.js";
      const [submitProfile, setSubmitProfile] = useState(false);
      const {token} = useStateContext();  
      const [showMore, setShowMore] = useState(
            POSITIONS.length > 10 ? 3 : POSITIONS.length > 5 ? 2 : 1
      );
      const [fetchadmins, setFetchadmins] = useState([]);

      const YOUR_ACCESS_TOKEN = token; 
      const headers = {
            'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
      };

      useEffect(() => {
            axios.get(apiRoutes.adminSelect, { headers })
            .then(response => {
                  setFetchadmins(response.data.admins);
                  passToSuccessLogs(response.data, currentFileName);
            })
            .catch(error => {
                  passToErrorLogs(`Admin Data not Fetched!  ${error}`, currentFileName);
            });
      }, []);

      const toggleShowMore = () => {
            setShowMore(showMore + 1);
            if(showMore == 2) {
                  formData.position11  = "";
                  formData.position12  = "";
                  formData.position13  = "";
                  formData.position14  = "";
                  formData.position15  = "";
            }
            if(showMore == 1) {
                  formData.position6  = "";
                  formData.position7  = "";
                  formData.position8  = "";
                  formData.position9  = "";
                  formData.position10  = "";
            }
      };

      const toggleShowLess = () => {
            setShowMore(showMore - 1);
      };
        
      const initialState = {
            pollid: POLL.pollid == null ? "" : POLL.pollid,
            description: POLL.description == null ? "" : POLL.description,
            participant_grade: POLL.participant_grade == null ? "" : POLL.participant_grade,
            application_start: POLL.application_start == null ? "" : POLL.application_start,
            application_end: POLL.application_end == null ? "" : POLL.application_end,
            validation_end: POLL.validation_end == null ? "" : POLL.validation_end,
            voting_start: POLL.voting_start == null ? "" : POLL.voting_start,
            voting_end: POLL.voting_end == null ? "" : POLL.voting_end,
            qualifications: POLL.qualifications == null ? "" : POLL.qualifications,
            requirements: POLL.requirements == null ? "" : POLL.requirements,
            admin_id: POLL.admin_id == null ? "" : POLL.admin_id,
            ongoing_apply: currentDate >= POLL.application_start ? true : false,
            ...Array.from({ length: 15 }, (_, i) => `position${i + 1}`).reduce((acc, key, index) => {
                  acc[key] = POSITIONS[index] ? POSITIONS[index].position_name : "";
                  return acc;
            }, {}),
            agreement: false,   
      };

      const [formData, setFormData] = useState(initialState);

      const handleChange = (e) => {
            const { name, value, type } = e.target;
        
            if (type === "checkbox") {
                  setFormData({ ...formData, [name]: !formData[name] });
            } else {
                  setFormData((prevData) => {
                  let updatedData = { ...prevData, [name]: value };

                  const validatedData = VotingDateValidation({ name, updatedData, toast }); 
                  
                  return validatedData;
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
                  "description",
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
                  else {      
                        setSubmitProfile(true);
                        try {
                              if (!token) {
                                    toast.error(messages.prohibit, { autoClose: true });
                              }
                              else {  
                                    const response = await axios.post(apiRoutes.editApplication, formData, {headers});
                                    if(response.data.status == 200) {
                                          toast.success(`${response.data.message}`, { autoClose: true });
                                    } else {
                                          toast.error(`${response.data.message}`, { autoClose: true });
                                    }
                                    UpdateLoading(true);
                                    passToSuccessLogs(response.data, currentFileName);
                              }
                        } catch (error) { 
                              toast.error("Error adding Election", { autoClose: true });
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
                              <li className="text-xxs fst-italic">When Validation Date ended, only the voting dates can be updated</li>
                              <li className="text-xxs fst-italic">Only the Super Admin can delete the election as long as it not Ongoing</li>
                              <li className="text-xxs fst-italic">Make sure to approve and finalize candidates before the Validation Date ended</li>
                              <li className="text-xxs fst-italic">Positions are already in order. The first one has the highest rank</li>
                              <li className="text-xxs fst-italic">When filing of candidacy starts, you can no longer add or delete positions</li>
                        </ul>
                        <SoftBox mt={2}>
                              <SoftBox component="form" role="form" className="px-md-0 px-2" onSubmit={handleSubmit}>
                                    <SoftTypography fontWeight="medium" textTransform="capitalize" color="success" textGradient>
                                          Election Information    
                                    </SoftTypography>
                                    <Grid container spacing={0} alignItems="center"> 
                                          <Grid item xs={12} md={6} lg={6} px={1}>
                                                <SoftTypography variant="button" className="me-1">Description:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput name="description" value={formData.description} onChange={handleChange} size="small" /> 
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
                                                      {fetchadmins && fetchadmins.length > 0 && fetchadmins.map((admin, index) => (
                                                      <option key={index} value={admin.username}>
                                                            {admin.name}
                                                      </option>
                                                      ))}
                                                </select>
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
                                                      disabled = {formData.ongoing_apply}
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
                                    
                                    <Grid container spacing={0} >
                                          <Grid item xs={12} md={6} px={1}>
                                                <SoftTypography variant="button" className="me-1">Qualification/s:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography> 
                                                <textarea name="qualifications" value={formData.qualifications} onChange={handleChange} className="form-control text-secondary" rows="4"></textarea>
                                          </Grid> 
                                          <Grid item xs={12} md={6} px={1}>
                                                <SoftTypography variant="button" className="me-1">Requirement/s:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <textarea name="requirements" value={formData.requirements} onChange={handleChange} className="form-control text-secondary" rows="4"></textarea> 
                                          </Grid> 
                                    </Grid> 
                                    <SoftTypography mt={2} fontWeight="medium" textTransform="capitalize" color="success" textGradient>
                                          Position Information    
                                    </SoftTypography>
                                    <Grid container spacing={10} alignItems="center">
                                          {showMore > 0 &&
                                          <Grid item xs={12} md={6} lg={4} px={1}>
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 1:</SoftTypography>
                                                <SoftInput name="position1" value={formData.position1.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 2:</SoftTypography>
                                                <SoftInput name="position2" value={formData.position2.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 3:</SoftTypography>
                                                <SoftInput name="position3" value={formData.position3.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 4:</SoftTypography>
                                                <SoftInput name="position4" value={formData.position4.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 5:</SoftTypography>
                                                <SoftInput name="position5" value={formData.position5.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                          </Grid>
                                          }
                                          {showMore > 1 &&
                                          <Grid item xs={12} md={6} lg={4} px={1}>
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 6:</SoftTypography>
                                                <SoftInput name="position6" value={formData.position6.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 7:</SoftTypography>
                                                <SoftInput name="position7" value={formData.position7.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 8:</SoftTypography>
                                                <SoftInput name="position8" value={formData.position8.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 9:</SoftTypography>
                                                <SoftInput name="position9" value={formData.position9.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 10:</SoftTypography>
                                                <SoftInput name="position10" value={formData.position10.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                          </Grid>
                                          }
                                          {showMore > 2 &&
                                          <Grid item xs={12} md={6} lg={4} px={1}>
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 11:</SoftTypography>
                                                <SoftInput name="position11" value={formData.position11.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 12:</SoftTypography>
                                                <SoftInput name="position12" value={formData.position12.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 13:</SoftTypography>
                                                <SoftInput name="position13" value={formData.position13.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 14:</SoftTypography>
                                                <SoftInput name="position14" value={formData.position14.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                                <SoftTypography variant="button" className="me-1 text-nowrap my-auto">Position 15:</SoftTypography>
                                                <SoftInput name="position15" value={formData.position15.toUpperCase()} onChange={handleChange} size="small" disabled = {formData.ongoing_apply}/> 
                                          </Grid>
                                          }
                                    </Grid> 
                                    <SoftBox mt={2} display="flex" justifyContent="start">
                                          <SoftButton onClick={toggleShowLess} variant="gradient" disabled={showMore <= 1 ||  formData.ongoing_apply} className="mx-2 text-xxs px-3 rounded-pill" size="small" color="secondary">
                                                Show Less
                                          </SoftButton>
                                          <SoftButton onClick={toggleShowMore} variant="gradient" disabled={showMore >= 3 || formData.ongoing_apply} className="mx-2 text-xxs px-3 rounded-pill" size="small" color="info">
                                                Add More
                                          </SoftButton>
                                    </SoftBox>
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

export default EditApplication;
