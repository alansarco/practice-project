// React components
import { Card, Grid} from "@mui/material";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import { toast } from "react-toastify";

import { passToSuccessLogs, passToErrorLogs } from "components/Api/Gateway";
import { apiRoutes } from "components/Api/ApiRoutes";
import { messages } from "components/General/Messages";
import axios from "axios";  
import { useStateContext } from "context/ContextProvider";

import FixedLoading from "components/General/FixedLoading"; 
// import Swal from "assets/sweetalert/sweetalert.min.js";
import { useState } from "react";
import SoftBadge from "components/SoftBadge";

function List({APPLICATION, POLL, HandleRendering, UpdateLoading}) {
      const [deleteData, setDeleteData] = useState(false);
      const [tab, setTab] = useState(1);
      const currentFileName = "layouts/elections/components/ApplicationForm/List.js";

      const {token} = useStateContext();  
      const YOUR_ACCESS_TOKEN = token; 
      const headers = {
            'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
      };

      const handleCancel = () => {
            HandleRendering(1);
      };
      const approveTab = () => {
            setTab(1);
      };
      const pendingTab = () => {
            setTab(2);
      };
      const rejectTab = () => {
            setTab(3);
      };


      const handleApprove = async (candidate) => {
            let candidateid = candidate.candidateid;
            let positionid = candidate.positionid;
            let pollid = candidate.pollid;
            let party = candidate.party;
            Swal.fire({
                  customClass: {
                  title: 'alert-title',
                  icon: 'alert-icon',
                  confirmButton: 'alert-confirmButton',
                  cancelButton: 'alert-cancelButton',
                  container: 'alert-container',
                  popup: 'alert-popup'
                  },
                  title: 'Approve Application?',
                  text: "Are you sure you want approve application? If you approve this, all other applications that is the same party of this candidate will be rejected automatically!",
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#6610f2',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'Yes, approve it!'
            }).then(async (result) => { 
                  if (result.isConfirmed) {
                        setDeleteData(true);
                        if (!token) {
                        toast.error(messages.prohibit, { autoClose: true });
                        } else {
                              try {
                                    const response = await axios.get(apiRoutes.approveApplication, 
                                          { params: { pollid, candidateid, positionid, party }, headers });
                        
                                    if (response.data.status === 200) {
                                          toast.success(`${response.data.message}`, { autoClose: true });
                                    } else {
                                          toast.error(`${response.data.message}`, { autoClose: true });
                                    }
                                    UpdateLoading(true);
                                    setDeleteData(false);
                                    passToSuccessLogs(response.data, currentFileName);
                        
                              } catch (error) {
                                    toast.error("Can't change application status!", { autoClose: true });
                                    setDeleteData(false);
                                    passToErrorLogs(error, currentFileName);
                              }
                        }
                  }
            });
      };
      const handleReject = async (candidate) => {
            let candidateid = candidate.candidateid;
            let positionid = candidate.positionid;
            let pollid = candidate.pollid;
            let party = candidate.party;
            Swal.fire({
                  customClass: {
                  title: 'alert-title',
                  icon: 'alert-icon',
                  confirmButton: 'alert-confirmButton',
                  cancelButton: 'alert-cancelButton',
                  container: 'alert-container',
                  popup: 'alert-popup'
                  },
                  title: 'Reject Application?',
                  text: "Are you sure you want reject application?",
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'Yes, reject it!'
            }).then(async (result) => { 
                  if (result.isConfirmed) {
                        setDeleteData(true);
                        if (!token) {
                        toast.error(messages.prohibit, { autoClose: true });
                        } else {
                              try {
                                    const response = await axios.get(apiRoutes.rejectApplication, 
                                          { params: { pollid, candidateid, positionid, party }, headers });
                        
                                    if (response.data.status === 200) {
                                          toast.success(`${response.data.message}`, { autoClose: true });
                                    } else {
                                          toast.error(`${response.data.message}`, { autoClose: true });
                                    }
                                    UpdateLoading(true);
                                    setDeleteData(false);
                                    passToSuccessLogs(response.data, currentFileName);
                        
                              } catch (error) {
                                    toast.error("Can't change application status!", { autoClose: true });
                                    setDeleteData(false);
                                    passToErrorLogs(error, currentFileName);
                              }
                        }
                  }
            });
      };
          
      return (  
      <>
            {deleteData && <FixedLoading /> }
            <SoftBox mt={5} mb={3} px={3}>      
                  <SoftBox mb={5} p={4} className="shadow-sm rounded-4 bg-white">
                        <SoftTypography fontWeight="medium" color="success" textGradient>
                              Application List!
                        </SoftTypography>
                        <SoftTypography fontWeight="bold" className="text-xs">
                              REMINDER:     
                        </SoftTypography> 
                        <ul className="text-danger fw-bold">
                              <li className="text-xxs fst-italic">The student will receive SMS notification once their application is approved</li>
                              <li className="text-xxs fst-italic">You can approve or disapprove application as long as validation date has not ended</li>
                        </ul>
                        
                        <Grid mt={3} container spacing={0} alignItems="center" justifyContent="end">
                              <Grid item xs={12} sm={4} md={2} pl={1}>
                                    <SoftBox mt={2} display="flex" justifyContent="end">
                                          <SoftButton onClick={approveTab} className="mx-2 w-100 text-xxs px-3 rounded-pill" size="small" color={tab == 1 ? "dark" : "white"}>
                                                Approved
                                          </SoftButton>
                                    </SoftBox>
                              </Grid>         
                              <Grid item xs={12} sm={4} md={2} pl={1}>
                                    <SoftBox mt={2} display="flex" justifyContent="end">
                                          <SoftButton onClick={pendingTab} className="mx-2 w-100 text-xxs px-3 rounded-pill" size="small" color={tab == 2 ? "dark" : "white"}>
                                                Pending
                                          </SoftButton>
                                    </SoftBox>
                              </Grid>                                        
                              <Grid item xs={12} sm={4} md={2} pl={1}>
                                    <SoftBox mt={2} display="flex" justifyContent="end">
                                          <SoftButton onClick={rejectTab} className="mx-2 w-100 text-xxs px-3 rounded-pill" size="small" color={tab == 3 ? "dark" : "white"}>
                                                Rejected
                                          </SoftButton>
                                    </SoftBox>
                              </Grid>                                  
                        </Grid>     
                        <SoftBox mt={2}>
                              {tab == 1 &&
                              <SoftBox className="px-md-0 px-2" >
                                    <SoftTypography fontWeight="medium" textTransform="capitalize" color="success" textGradient>
                                          Approved Applications    
                                    </SoftTypography>
                                    {APPLICATION && APPLICATION.length > 0 && 
                                    APPLICATION.map((position) => (
                                          <Grid container className="border-bottom border-2" spacing={0} alignItems="center" key={position.positionid}>
                                                <Grid item xs={12} md={4} px={1}>
                                                <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                      {position.position_name || " "}
                                                </SoftTypography>
                                                </Grid>
                                                <Grid item xs={12} md={8} px={1}>
                                                {position.candidates && (
                                                // Parse the candidates string into an array of objects
                                                (() => {
                                                      let candidatesArray = [];
                                                      try {
                                                      // Parse the string into a valid JSON array
                                                      candidatesArray = JSON.parse('[' + position.candidates + ']')
                                                      .filter(candidate => candidate.status === "1"); // Filtering approved candidates
                                                      } catch (error) {
                                                      console.error('Error parsing candidates:', error);
                                                      }

                                                      // Check if there are any approved candidates
                                                      if (candidatesArray.length === 0) {
                                                      return (
                                                      <SoftBox my={2} className="p-3">
                                                            <SoftTypography className="me-1 text-sm fw-normal fst-italic text-dark">
                                                            No Application
                                                            </SoftTypography>
                                                      </SoftBox>
                                                      );
                                                      }

                                                      return candidatesArray.map((candidate) => (
                                                      candidate.candidateid ? 
                                                      <SoftBox my={2} className="shadow p-3" key={candidate.candidateid}>
                                                            <SoftBadge badgeContent={candidate.status === "1" ? "approved" : candidate.status === "2" ? "rejected" : "pending"} variant="gradient" 
                                                            color={candidate.status === "1" ? "info" : candidate.status === "2" ? "primary" : "warning"} size="lg"
                                                            className="d-flex justify-content-end"
                                                            />
                                                            <SoftTypography color="info" className="me-1 text-sm fw-normal">
                                                            {candidate.candidateid || " "}
                                                            </SoftTypography>
                                                            <SoftTypography color="dark" className="me-1 text-sm fw-bold">
                                                            {candidate.candidate_name || " "}
                                                            </SoftTypography>
                                                            <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                            Grade {candidate.grade}
                                                            </SoftTypography>
                                                            <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                            {candidate.party || " "}
                                                            </SoftTypography>
                                                            <SoftTypography color="dark" className="me-1 text-sm fw-bold">
                                                            Platform:
                                                            <SoftTypography color="secondary" className="me-1 text-sm fw-normal fst-italic">
                                                            {candidate.platform || " "}
                                                            </SoftTypography>
                                                            </SoftTypography>
                                                            <Grid container spacing={0} alignItems="center" justifyContent="start">
                                                            <Grid item xs={12} sm={5} lg={3}>
                                                                  <SoftBox display="flex" justifyContent="end">
                                                                  <SoftButton onClick={() => handleReject(candidate)} className="mx-1 mt-1 mt-md-0 w-100 text-xxs px-2 rounded-pill" size="small" color="primary">
                                                                  Reject
                                                                  </SoftButton>
                                                                  </SoftBox>
                                                            </Grid>                                
                                                            </Grid>     
                                                      </SoftBox>
                                                      : 
                                                      <SoftBox my={2} className="p-3">
                                                            <SoftTypography className="me-1 text-sm fw-normal fst-italic text-dark">
                                                            No Application
                                                            </SoftTypography>
                                                      </SoftBox>
                                                      ));
                                                })()
                                                )}
                                                </Grid>
                                          </Grid>  
                                    ))}
                              </SoftBox>
                              }
                              {tab == 2 &&
                              <SoftBox className="px-md-0 px-2" >
                                    <SoftTypography fontWeight="medium" textTransform="capitalize" color="success" textGradient>
                                          Pending Applications    
                                    </SoftTypography>
                                    {APPLICATION && APPLICATION.length > 0 && 
                                    APPLICATION.map((position) => (
                                          <Grid container className="border-bottom border-2" spacing={0} alignItems="center" key={position.positionid}>
                                                <Grid item xs={12} md={4} px={1}>
                                                <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                      {position.position_name || " "}
                                                </SoftTypography>
                                                </Grid>
                                                <Grid item xs={12} md={8} px={1}>
                                                {position.candidates && (
                                                // Parse the candidates string into an array of objects
                                                (() => {
                                                      let candidatesArray = [];
                                                      try {
                                                      // Parse the string into a valid JSON array
                                                      candidatesArray = JSON.parse('[' + position.candidates + ']')
                                                      .filter(candidate => candidate.status === "0"); // Filtering approved candidates
                                                      } catch (error) {
                                                      console.error('Error parsing candidates:', error);
                                                      }

                                                      // Check if there are any approved candidates
                                                      if (candidatesArray.length === 0) {
                                                      return (
                                                      <SoftBox my={2} className="p-3">
                                                            <SoftTypography className="me-1 text-sm fw-normal fst-italic text-dark">
                                                            No Application
                                                            </SoftTypography>
                                                      </SoftBox>
                                                      );
                                                      }

                                                      return candidatesArray.map((candidate) => (
                                                      candidate.candidateid ? 
                                                      <SoftBox my={2} className="shadow p-3" key={candidate.candidateid}>
                                                            <SoftBadge badgeContent={candidate.status === "1" ? "approved" : candidate.status === "2" ? "rejected" : "pending"} variant="gradient" 
                                                            color={candidate.status === "1" ? "info" : candidate.status === "2" ? "primary" : "warning"} size="lg"
                                                            className="d-flex justify-content-end"
                                                            />
                                                            <SoftTypography color="info" className="me-1 text-sm fw-normal">
                                                            {candidate.candidateid || " "}
                                                            </SoftTypography>
                                                            <SoftTypography color="dark" className="me-1 text-sm fw-bold">
                                                            {candidate.candidate_name || " "}
                                                            </SoftTypography>
                                                            <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                            Grade {candidate.grade}
                                                            </SoftTypography>
                                                            <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                            {candidate.party || " "}
                                                            </SoftTypography>
                                                            <SoftTypography color="dark" className="me-1 text-sm fw-bold">
                                                            Platform:
                                                            <SoftTypography color="secondary" className="me-1 text-sm fw-normal fst-italic">
                                                            {candidate.platform || " "}
                                                            </SoftTypography>
                                                            </SoftTypography>
                                                            <Grid container spacing={0} alignItems="center" justifyContent="start">
                                                            <Grid item xs={12} sm={5} lg={3}>
                                                                  <SoftBox display="flex" justifyContent="end">
                                                                  <SoftButton onClick={() => handleReject(candidate)} className="mx-1 mt-1 mt-md-0 w-100 text-xxs px-2 rounded-pill" size="small" color="primary">
                                                                  Reject
                                                                  </SoftButton>
                                                                  </SoftBox>
                                                            </Grid>                                        
                                                            <Grid item xs={12} sm={5} lg={3}>
                                                                  <SoftBox display="flex" justifyContent="end">
                                                                  <SoftButton onClick={() => handleApprove(candidate)} className="mx-1 mt-1 mt-md-0 w-100 text-xxs px-2 rounded-pill" size="small" color="info">
                                                                  Approve
                                                                  </SoftButton>
                                                                  </SoftBox>
                                                            </Grid>                                        
                                                            </Grid>     
                                                      </SoftBox>
                                                      : 
                                                      <SoftBox my={2} className="p-3">
                                                            <SoftTypography className="me-1 text-sm fw-normal fst-italic text-dark">
                                                            No Application
                                                            </SoftTypography>
                                                      </SoftBox>
                                                      ));
                                                })()
                                                )}
                                                </Grid>
                                          </Grid>  
                                    ))}
                              </SoftBox>
                              }
                              {tab == 3 &&
                              <SoftBox className="px-md-0 px-2" >
                                    <SoftTypography fontWeight="medium" textTransform="capitalize" color="success" textGradient>
                                          Rejected Applications    
                                    </SoftTypography>
                                    {APPLICATION && APPLICATION.length > 0 && 
                                    APPLICATION.map((position) => (
                                          <Grid container className="border-bottom border-2" spacing={0} alignItems="center" key={position.positionid}>
                                                <Grid item xs={12} md={4} px={1}>
                                                <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                      {position.position_name || " "}
                                                </SoftTypography>
                                                </Grid>
                                                <Grid item xs={12} md={8} px={1}>
                                                {position.candidates && (
                                                // Parse the candidates string into an array of objects
                                                (() => {
                                                      let candidatesArray = [];
                                                      try {
                                                      // Parse the string into a valid JSON array
                                                      candidatesArray = JSON.parse('[' + position.candidates + ']')
                                                      .filter(candidate => candidate.status === "2"); // Filtering approved candidates
                                                      } catch (error) {
                                                      console.error('Error parsing candidates:', error);
                                                      }

                                                      // Check if there are any approved candidates
                                                      if (candidatesArray.length === 0) {
                                                      return (
                                                      <SoftBox my={2} className="p-3">
                                                            <SoftTypography className="me-1 text-sm fw-normal fst-italic text-dark">
                                                            No Application
                                                            </SoftTypography>
                                                      </SoftBox>
                                                      );
                                                      }

                                                      return candidatesArray.map((candidate) => (
                                                      candidate.candidateid ? 
                                                      <SoftBox my={2} className="shadow p-3" key={candidate.candidateid}>
                                                            <SoftBadge badgeContent={candidate.status === "1" ? "approved" : candidate.status === "2" ? "rejected" : "pending"} variant="gradient" 
                                                            color={candidate.status === "1" ? "info" : candidate.status === "2" ? "primary" : "warning"} size="lg"
                                                            className="d-flex justify-content-end"
                                                            />
                                                            <SoftTypography color="info" className="me-1 text-sm fw-normal">
                                                            {candidate.candidateid || " "}
                                                            </SoftTypography>
                                                            <SoftTypography color="dark" className="me-1 text-sm fw-bold">
                                                            {candidate.candidate_name || " "}
                                                            </SoftTypography>
                                                            <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                            Grade {candidate.grade}
                                                            </SoftTypography>
                                                            <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                            {candidate.party || " "}
                                                            </SoftTypography>
                                                            <SoftTypography color="dark" className="me-1 text-sm fw-bold">
                                                            Platform:
                                                            <SoftTypography color="secondary" className="me-1 text-sm fw-normal fst-italic">
                                                            {candidate.platform || " "}
                                                            </SoftTypography>
                                                            </SoftTypography>
                                                            {candidate.status !== "1" &&
                                                            <Grid container spacing={0} alignItems="center" justifyContent="start">                                   
                                                            <Grid item xs={12} sm={5} lg={3}>
                                                                  <SoftBox display="flex" justifyContent="end">
                                                                  <SoftButton onClick={() => handleApprove(candidate)} className="mx-1 mt-1 mt-md-0 w-100 text-xxs px-2 rounded-pill" size="small" color="info">
                                                                  Approve
                                                                  </SoftButton>
                                                                  </SoftBox>
                                                            </Grid>                                        
                                                            </Grid>     
                                                            }
                                                      </SoftBox>
                                                      : 
                                                      <SoftBox my={2} className="p-3">
                                                            <SoftTypography className="me-1 text-sm fw-normal fst-italic text-dark">
                                                            No Application
                                                            </SoftTypography>
                                                      </SoftBox>
                                                      ));
                                                })()
                                                )}
                                                </Grid>

                                                
                                          </Grid>  
                                    ))}
                                    
                              </SoftBox>
                              }
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
                  </SoftBox>
            </SoftBox>
      </>
      );
}

export default List;
