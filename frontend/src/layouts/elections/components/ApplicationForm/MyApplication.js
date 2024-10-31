// React components
import { Grid} from "@mui/material";
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
import DownloadButton from "components/General/DownloadButton";

function MyApplication({APPLICATION, POLL, HandleRendering, UpdateLoading}) {
    const [deleteData, setDeleteData] = useState(false);
    const currentFileName = "layouts/elections/components/ApplicationForm/MyApplication.js";

    const {token} = useStateContext();  
    const YOUR_ACCESS_TOKEN = token; 
    const headers = {
        'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
    };

    const handleCancel = () => {
        HandleRendering(1);
      };

      const pollid = POLL.pollid;
      const candidateid = APPLICATION.candidateid;
      const fileDownloadUrl = `${process.env.REACT_APP_BASE_URL}/${APPLICATION.requirements_url}`;
      console.log('File Download URL:', fileDownloadUrl);

      const handleDelete = async (e) => {
        e.preventDefault();     
        Swal.fire({
          customClass: {
            title: 'alert-title',
            icon: 'alert-icon',
            confirmButton: 'alert-confirmButton',
            cancelButton: 'alert-cancelButton',
            container: 'alert-container',
            popup: 'alert-popup'
          },
          title: 'Delete Application?',
          text: "Are you sure you want to delete your application? You can no longer revert once deleted!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',  
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.isConfirmed) {
            setDeleteData(true);
              if (!token) {
                toast.error(messages.prohibit, { autoClose: true });
              }
              else {  
                axios.get(apiRoutes.deleteApplication, { params: { pollid, candidateid }, headers })
                  .then(response => {
                    if (response.data.status == 200) {
                      toast.success(`${response.data.message}`, { autoClose: true });
                        HandleRendering(1);
                    } else {
                      toast.error(`${response.data.message}`, { autoClose: true });
                    }
                    passToSuccessLogs(response.data, currentFileName);
                    HandleRendering(1);
                    setDeleteData(false);
                  })  
                  .catch(error => {
                    setDeleteData(false);
                    toast.error("Cant delete election!", { autoClose: true });
                    passToErrorLogs(error, currentFileName);
                  });
              }
          }
        })
      };

      

      return (  
      <>
            {deleteData && <FixedLoading /> }
            <SoftBox mt={5} mb={3} px={2}>      
                  <SoftBox mb={5} p={4} className="shadow-sm rounded-4 bg-white">
                        <SoftTypography fontWeight="medium" color="success" textGradient>
                              Good Day!
                        </SoftTypography>
                        <SoftTypography fontWeight="bold" className="text-xs">
                              It seems that you already applied for this election.     
                        </SoftTypography> 
                        <ul className="text-danger fw-bold">
                              <li className="text-xxs fst-italic">You will receive an SMS notification once application is approved</li>
                        </ul>
                        {/* Download Button */}
                        {APPLICATION.requirements && (
                            <Grid container spacing={0} alignItems="center">
                                <Grid item xs={12} md={6} lg={4} px={1}>
                                    <SoftButton 
                                        component="a" 
                                        href={fileDownloadUrl} 
                                        target="_blank" 
                                        download 
                                        variant="gradient" 
                                        color="primary" 
                                        size="small"
                                    >
                                        Download Requirements
                                    </SoftButton>
                                </Grid>
                            </Grid>
                        )}
                        {/* <DownloadButton candidateId={APPLICATION.candidateid} /> */}
                        <SoftBox mt={2}>
                              <SoftBox className="px-md-0 px-2" >
                                    <SoftTypography fontWeight="medium" textTransform="capitalize" color="success" textGradient>
                                          Application Information    
                                    </SoftTypography>
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} md={6} lg={4} px={1}>
                                                <SoftTypography variant="button" className="me-1 text-nowrap"> Position: </SoftTypography>
                                                <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                    {APPLICATION.position_name}
                                                </SoftTypography>
                                          </Grid>
                                    </Grid>         
                                    <Grid container spacing={0} alignItems="center"> 
                                          <Grid item xs={12} md={6} lg={4} px={1}>
                                                <SoftTypography variant="button" className="me-1">Partylist:</SoftTypography>
                                                <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                    {APPLICATION.party || "None"}
                                                </SoftTypography>
                                          </Grid>  
                                    </Grid>                             
                                    <Grid container spacing={0} >
                                          <Grid item xs={12} md={12} px={1}>
                                                <SoftTypography variant="button" className="me-1">Platform/s:</SoftTypography>
                                                <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                    {APPLICATION.platform || "None"}
                                                </SoftTypography>
                                          </Grid> 
                                    </Grid> 
                                    <Grid container spacing={0} >
                                          <Grid item xs={12} md={12} px={1}>
                                                <SoftTypography variant="button" className="me-1">Status:</SoftTypography>
                                                <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                    {APPLICATION.status == 1 ? "Approved" : 
                                                        APPLICATION.status ==  2 ? "Rejected" :
                                                        "Pending"}
                                                </SoftTypography>
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
                                        {APPLICATION.status != 1 && 
                                            <Grid item xs={12} sm={4} md={2} pl={1}>
                                                <SoftBox mt={2} display="flex" justifyContent="end">
                                                    <SoftButton onClick={handleDelete} variant="gradient" color="warning" className="mx-2 w-100 text-xxs px-3 rounded-pill" size="small">
                                                    Delete
                                                    </SoftButton>
                                                </SoftBox>
                                            </Grid>
                                        }
                                        
                                    </Grid>     
                              </SoftBox>
                        </SoftBox>
                  </SoftBox>
            </SoftBox>
      </>
      );
}

export default MyApplication;
