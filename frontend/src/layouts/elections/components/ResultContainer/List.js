import { Checkbox, Grid, Card} from "@mui/material";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import { toast } from "react-toastify";
import { messages } from "components/General/Messages";

import axios from "axios";  
import { useStateContext } from "context/ContextProvider";
import { useState } from "react";
import FixedLoading from "components/General/FixedLoading"; 
import { passToErrorLogs, passToSuccessLogs  } from "components/Api/Gateway";
import { apiRoutes } from "components/Api/ApiRoutes";

import VerticalBarChart from "essentials/Charts/BarCharts/VerticalBarChart";
import CachedTwoToneIcon from '@mui/icons-material/CachedTwoTone';
import Table from "layouts/elections/components/ResultContainer/resulttable";
import { tablehead } from "layouts/elections/components/ResultContainer/resulthead";
import DefaultDoughnutChart from "essentials/Charts/DoughnutCharts/DefaultDoughnutChart";
import { distributionSelect } from "components/General/Utils";
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';

function List({ USER, RESULT, CANDIDATES, POLL, HandleRendering, UpdateLoading, reload, VOTE, MAXVOTERS, CURRENTVOTES, PARTICIPANTS }) {
      const [isLoading, setLoading] = useState(false);
      const currentFileName = "layouts/elections/components/ResultContainer/List.js";
      const [tabtitle, setTabtitle] = useState(1);
      const { token, access } = useStateContext();
      const YOUR_ACCESS_TOKEN = token;
      const headers = {
      'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
      };

      const handleCancel = () => {
            HandleRendering(1);
      };
      const handleRefresh = () => {
            UpdateLoading(true);
      };

      const handleResultTab = () => {
            setTabtitle(1);
      };
      const handleParticipantTab = () => {
            setTabtitle(2);
      };
      const handleVoteTab = () => {
            setTabtitle(3);
      };

      // Initialize state for the form
      const initialState = {
            positionSelections: {},  // Object to store selected candidate per position
            pollid: POLL.pollid,
            distribute: 1,
            agreement: false,        // Agreement checkbox
      };

      const pollid = POLL.pollid;

      const [formData, setFormData] = useState(initialState);

      // Handle input changes for select inputs and checkbox
      const handleChange = (e) => {
            const { name, value, type } = e.target;
            if (type === "checkbox") {
                  setFormData({ ...formData, [name]: !formData[name] });
            } else {
                  setFormData({
                  ...formData,
                  positionSelections: {
                  ...formData.positionSelections,
                  [name]: value  // Store selected candidate by position
                  }
                  });
            }
      };

      
      const handleFilter = (e) => {
            const { name, value, type } = e.target;
            if (type === "checkbox") {
                  setFormData({ ...formData, [name]: !formData[name]});
            } else {
                  setFormData({ ...formData, [name]: value });
            }
      };

      const handleNotify = async (e) => {
            e.preventDefault(); 
            toast.dismiss();
            setLoading(true);
            try {
                  if (!token) {
                        toast.error(messages.prohibit, { autoClose: true });
                  }
                  else {  
                        const response = await axios.post(apiRoutes.notifyVoters, formData, {headers});
                        if(response.data.status == 200) {
                              toast.success(`${response.data.message}`, { autoClose: true });
                              UpdateLoading(true);
                        } else {
                              toast.error(`${response.data.message}`, { autoClose: true });
                        }
                        passToSuccessLogs(response.data, currentFileName);
                  }
            } catch (error) { 
                  toast.error("Error Notifying Student Voters!", { autoClose: true });
                  passToErrorLogs(error, currentFileName);
            }     
            setLoading(false);
      };

      const handleSubmit = async (e) => {
            e.preventDefault(); 
            toast.dismiss();
            // Check if all required fields are empty
            const requiredFields = [
                  // "pollid",
            ];
            const emptyRequiredFields = requiredFields.filter(field => !formData[field]);

            if (emptyRequiredFields.length === 0) {
                  if(!formData.agreement) {
                        toast.warning(messages.agreement, { autoClose: true });
                  }
                  else {      
                        setLoading(true);
                        try {
                              if (!token) {
                                    toast.error(messages.prohibit, { autoClose: true });
                              }
                              else {  
                                    const response = await axios.post(apiRoutes.submitVote, formData, {headers});
                                    if(response.data.status == 200) {
                                          toast.success(`${response.data.message}`, { autoClose: true });
                                          setFormData(initialState);
                                          UpdateLoading(true);
                                          setTabtitle(1);
                                    } else {
                                          toast.error(`${response.data.message}`, { autoClose: true });
                                    }
                                    passToSuccessLogs(response.data, currentFileName);
                              }
                        } catch (error) { 
                              toast.error("Error casting Vote!", { autoClose: true });
                              passToErrorLogs(error, currentFileName);
                        }     
                        setLoading(false);
                  }
                  
            } else {
                  // Display an error message or prevent form submission
                  toast.warning(messages.required, { autoClose: true });
            }
      };


  return (
    <>
      {reload && <FixedLoading />}
      {isLoading && <FixedLoading />}
      <SoftBox mt={5} mb={3} px={2}>      
            <SoftBox mb={5}>    
                  <Grid container spacing={0} alignItems="center" justifyContent="end">
                        <Grid item xs={12} md={5} pl={1}>
                              <SoftBox display="flex" justifyContent="end">
                                    <SoftButton onClick={handleRefresh} className="mt-2 mt-sm-0 mx-1 text-xxs px-3 rounded-pill" size="medium" color="success" iconOnly>
                                          <CachedTwoToneIcon /> 
                                    </SoftButton>
                                    <SoftButton onClick={handleResultTab} className="mt-2 mt-sm-0 mx-1 w-100 text-xxs px-5 rounded-pill text-nowrap" size="small" color={tabtitle == 1 ? "dark" : "white"}>
                                          Results
                                    </SoftButton>
                                    {access >= 10 && 
                                    <SoftButton onClick={handleParticipantTab} className="mt-2 mt-sm-0 mx-1 w-100 text-xxs px-5 rounded-pill text-nowrap" size="small" color={tabtitle == 2 ? "dark" : "white"}>
                                          Participants
                                    </SoftButton>
                                    }          
                                    {access >= 10 && 
                                    <SoftButton onClick={handleVoteTab} className="mt-2 mt-sm-0 mx-1 w-100 text-xxs px-5 rounded-pill text-nowrap" size="small" color={tabtitle == 3 ? "dark" : "white"}>
                                          Vote Now
                                    </SoftButton>
                                    }            
                              </SoftBox>
                        </Grid>   
                  </Grid>   
                  {tabtitle == 1 && 
                  <SoftBox mt={2}>
                        <SoftBox className="px-md-0 px-2" >
                              <Grid mt={3} container spacing={0} alignItems="center" justifyContent="center">
                                    <Grid item xs={12} sm={12} xl={12}>
                                    <VerticalBarChart
                                          title={POLL.pollname}
                                          nodata={RESULT.candidateid && RESULT.candidateid.every(value => value === "0")}
                                          height="20rem"
                                          maxCount={MAXVOTERS}
                                          currentCount={CURRENTVOTES}
                                          chart={{
                                          labels: RESULT.candidateid || [], 
                                          datasets: [{
                                                color: "dark",
                                                data: RESULT.votes || [] 
                                          }],
                                          }}
                                    />
                                    </Grid>    
                                    {access >= 10 &&
                                    <>
                                    <Grid item xs={12} sm={6} alignItems="center" className="d-block d-md-flex" justifyContent="center" mt={4}>
                                          <SoftTypography className="me-2 text-nowrap" variant="h6">Filter Distribution Result:</SoftTypography>
                                          <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer w-100" name="distribute" value={formData.distribute} onChange={handleFilter} >
                                                {distributionSelect && distributionSelect.map((distribute) => (
                                                <option key={distribute.value} value={distribute.value}>
                                                      {distribute.desc}
                                                </option>
                                                ))}
                                          </select>
                                    </Grid> 
                                    </>
                                    }
                                    {access >= 10 && formData.distribute == 1 &&
                                    <Grid item xs={12} sm={12} xl={12}>
                                          <SoftTypography mt={3} fontWeight="bold" color="info" textGradient fontSize="1.5rem">DISTRIBUTION OF VOTES BY GENDER</SoftTypography>
                                          <Grid container spacing={2} alignItems="center" justifyContent="start">
                                                {RESULT && RESULT.voters_info.map((event, index) => (
                                                <Grid item xs={12} md={6} lg={4}>
                                                      <DefaultDoughnutChart
                                                      key={index} 
                                                      title={RESULT.candidateid[index]} 
                                                      chart={{
                                                            labels: ["Male", "Female"],
                                                            datasets: {
                                                            label: "Elections",
                                                            backgroundColors: ["dark", "primary"],
                                                            data: Object.values(event), 
                                                            },
                                                      }}
                                                      />
                                                </Grid> 
                                                ))}
                                          </Grid>   
                                    </Grid> 
                                    } 
                                    {access >= 10 && formData.distribute == 2 &&
                                    <Grid item xs={12} sm={12} xl={12}>
                                          <SoftTypography mt={3} fontWeight="bold" color="info" textGradient fontSize="1.5rem">DISTRIBUTION OF VOTES BY GRADE LEVEL</SoftTypography>
                                          <Grid container spacing={2} alignItems="center" justifyContent="start">
                                                {RESULT && RESULT.voters_grade.map((event, index) => (
                                                <Grid item xs={12} md={6} lg={4}>
                                                      <DefaultDoughnutChart
                                                      key={index} 
                                                      title={RESULT.candidateid[index]} 
                                                      chart={{
                                                            labels: ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],  
                                                            datasets: {
                                                                  label: "Elections",
                                                                  backgroundColors: ["dark", "success", "primary", "warning", "info", "error"],
                                                                  data: Object.values(event), 
                                                            },
                                                      }}
                                                      />
                                                </Grid> 
                                                ))}
                                          </Grid>   
                                    </Grid>   
                                    } 
                                    
                              </Grid>   
                        </SoftBox>
                        <Grid mt={3} container spacing={0} alignItems="center" justifyContent="end">
                              <Grid item xs={12} sm={4} md={2} pl={1}>
                                    <SoftBox mt={2} display="flex" justifyContent="end">
                                          <SoftButton onClick={handleCancel} className="mx-2 w-100 text-xxs px-3 rounded-pill" size="small" color="light">
                                                Back
                                          </SoftButton>
                                    </SoftBox>
                              </Grid>     
                        </Grid>   
                  </SoftBox>
                  }
                  {tabtitle == 2 && 
                  <SoftBox mt={3}>
                        <SoftBox className="px-md-0 px-2" > 
                              <Card className="bg-white px-4 pt-5">
                                    <SoftBox display="flex" justifyContent="end">
                                          {USER === POLL.admin_id &&
                                          <SoftBox display="flex" justifyContent="end" className="my-auto me-2">
                                                <SoftButton onClick={handleNotify} variant="gradient" className="my-auto rounded-pill" size="medium" color="info" iconOnly>
                                                      <NotificationsTwoToneIcon/>
                                                </SoftButton>
                                          </SoftBox>
                                          }
                                          <SoftTypography color="info" className="text-center my-auto" variant="h6">
                                                Total Voters:
                                                <b className="text-dark">{MAXVOTERS || 0}</b>
                                          </SoftTypography>
                                          <SoftTypography color="info" className="text-center ms-3 my-auto" variant="h6">
                                                Casted Votes:
                                                <b className="text-dark">{CURRENTVOTES || 0}</b>
                                          </SoftTypography>
                                    </SoftBox>
                                    <Table table="sm" PARTICIPANTS={PARTICIPANTS} tablehead={tablehead} />
                              </Card>
                        </SoftBox>
                        <Grid mt={3} container spacing={0} alignItems="center" justifyContent="end">
                              <Grid item xs={12} sm={4} md={2} pl={1}>
                                    <SoftBox mt={2} display="flex" justifyContent="end">
                                          <SoftButton onClick={handleCancel} className="mx-2 w-100 text-xxs px-3 rounded-pill" size="small" color="light">
                                                Back
                                          </SoftButton>
                                    </SoftBox>
                              </Grid>     
                        </Grid>   
                  </SoftBox>
                  }
                  {tabtitle == 3 && 
                  <SoftBox mt={2}>
                        <SoftBox component="form" role="form" onSubmit={handleSubmit} className="px-md-0 px-4 py-5 bg-white shadow rounded-5">
                              <SoftBox display="flex" className="mb-4">
                                    <SoftTypography variant="h3" color="primary" textGradient className="m-auto text-uppercase fw-normal text-center fw-bold">
                                    Please vote wisely!
                                    </SoftTypography>
                              </SoftBox>

                              {/* Loop through positions and display select input for each */}
                              {CANDIDATES && CANDIDATES.length > 0 && 
                                    CANDIDATES.map((position, index) => (
                                    <Grid container className="py-2" spacing={0} justifyContent="center" alignItems="center" key={index}>
                                          <Grid item xs={12} md={4} px={1}>
                                                <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                {position.position_name || " "}
                                                </SoftTypography>
                                          </Grid>
                                          <Grid item xs={12} md={4} px={1}>
                                                <select
                                                className="form-control form-select form-select text-secondary rounded-5 cursor-pointer"
                                                name={`position${position.positionid}`} // Dynamic name based on position ID
                                                value={formData.positionSelections[`position${position.positionid}`] || ""}
                                                onChange={handleChange}
                                                >
                                                <option value="">Select Candidate</option>

                                                {position.candidates && JSON.parse('[' + position.candidates + ']').map((candidate) => (
                                                      candidate.candidateid ?
                                                      <option key={candidate.candidateid} value={candidate.candidateid}>
                                                            {candidate.candidate_name}
                                                      </option> :
                                                      <option value="">No Candidates</option>

                                                ))}
                                                </select>
                                          </Grid>
                                    </Grid>  
                                    ))
                              }
                              <Grid mt={3} container spacing={0} alignItems="center" justifyContent="center">
                                    <Grid item xs={12} md={6} pl={1}>
                                          <Checkbox 
                                                className={` ${formData.agreement ? '' : 'border-2 border-success'}`} 
                                                name="agreement" 
                                                checked={formData.agreement} 
                                                onChange={handleChange} 
                                          />
                                          <SoftTypography variant="button" className="me-1 ms-2">Verify Data </SoftTypography>
                                          <SoftTypography variant="p" className="text-xxs fw-bold text-danger fst-italic">(Once submitted, you can no longer modify your votes) </SoftTypography>
                                          <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                    </Grid>
                              </Grid>
                              {/* Form actions */}
                              <Grid className="px-3" mt={3} container spacing={0} alignItems="center" justifyContent="center">
                                    <Grid item xs={12} sm={4} md={2} pl={1}>
                                          <SoftBox mt={2} display="flex" justifyContent="center">
                                                <SoftButton onClick={() => HandleRendering(1)} className="mx-2 w-100 text-xxs px-3 rounded-pill" size="small" color="light">
                                                      Back
                                                </SoftButton>
                                          </SoftBox>
                                    </Grid>     
                                    <Grid item xs={12} sm={4} md={2} pl={1}>
                                          <SoftBox mt={2} display="flex" justifyContent="center">
                                                <SoftButton variant="gradient" type="submit" className="mx-2 w-100 text-xxs px-3 rounded-pill text-nowrap" size="small" color="success">
                                                      Cast Vote
                                                </SoftButton>
                                          </SoftBox>
                                    </Grid>     
                              </Grid> 
                        </SoftBox>
                  </SoftBox>
                  }                        
            </SoftBox>
      </SoftBox>
    </>
  );
}

export default List;
