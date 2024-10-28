// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// React components
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import 'chart.js/auto';
// React examples
import DashboardLayout from "essentials/LayoutContainers/DashboardLayout";
import DashboardNavbar from "essentials/Navbars";
import Footer from "essentials/Footer";
import { ToastContainer, toast } from 'react-toastify';

// React base styles
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
// Data
import TimelineList from "essentials/Timeline/TimelineList";
import TimelineItem from "essentials/Timeline/TimelineItem";
import FixedLoading from "components/General/FixedLoading";
import { passToSuccessLogs, passToErrorLogs } from "components/Api/Gateway";

import React, { useState, useEffect } from "react";
import { useStateContext } from "context/ContextProvider";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";

function MyApplications() {
  const currentFileName = "layouts/announcements/index.js";
  const {token, access, updateTokenExpiration} = useStateContext();
  updateTokenExpiration();
  if (!token) {
    return <Navigate to="/authentication/sign-in" />
  }
  else if(token && access != 5) {
    return <Navigate to="/not-found" />
  }

  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
        'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
  };

  const [reload, setReload] = useState(false);
  const [rendering, setRendering] = useState(1);
  const [fetchdata, setFetchdata] = useState([]);
  const [searchTriggered, setSearchTriggered] = useState(true);


  useEffect(() => {
    if (searchTriggered) {
      setReload(true);
      axios.get(apiRoutes.myPages, {headers} )
        .then(response => {
          setFetchdata(response.data.application);
          passToSuccessLogs(response.data, currentFileName);
          setReload(false);
        })
        .catch(error => {
          passToErrorLogs(`My Applications not Fetched!  ${error}`, currentFileName);
          setReload(false);
        });
        setSearchTriggered(false);
    }
  }, [searchTriggered]);

  const handleDelete = async (apply) => {
    let candidateid = apply.candidateid;
    let pollid = apply.pollid;
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
      text: "Are you sure you want to delete this data? You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',  
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setSearchTriggered(true);
          if (!token) {
            toast.error(messages.prohibit, { autoClose: true });
          }
          else {  
            axios.get(apiRoutes.deleteApplication, { params: { pollid, candidateid }, headers })
              .then(response => {
                if (response.data.status == 200) {
                  toast.success(`${response.data.message}`, { autoClose: true });
                } else {
                  toast.error(`${response.data.message}`, { autoClose: true });
                }
                passToSuccessLogs(response.data, currentFileName);
                setSearchTriggered(true);
              })  
              .catch(error => {
                setSearchTriggered(true);
                toast.error("Cant delete applications!", { autoClose: true });
                passToErrorLogs(error, currentFileName);
              });
          }
      }
    })
  };

  return (
    <>
      {reload && <FixedLoading /> }
      <DashboardLayout>
        <DashboardNavbar RENDERNAV={rendering} />       
        <SoftBox p={2}>
            <SoftBox className="px-md-4 px-3 py-2" display="flex" justifyContent="space-between" alignItems="center">
                <SoftBox>
                    <SoftTypography className="text-uppercase text-secondary" variant="h6" >My Applications</SoftTypography>
                </SoftBox>
            </SoftBox>
            <Card className="bg-white rounded-5">
                <SoftBox mb={3} p={2} >
                    <Grid container spacing={3}>
                        <Grid item xs={12} >
                          <TimelineList shadow="shadow-none" className="bg-success" title=" "  >
                              {((fetchdata && fetchdata.application) 
                              && !fetchdata.application.length > 0) ?
                              <SoftTypography mt={0} color="dark" fontSize="0.8rem" className="text-center">
                                  You have no applications!
                              </SoftTypography> : " "
                              }
                              {((fetchdata && fetchdata.application) && fetchdata.application.length > 0) ?
                              <SoftTypography mt={0} fontWeight="bold" color="success" textGradient fontSize="1rem">
                                  Here is your list of applications. You must receive SMS notification when your applications is approved or rejected.
                              </SoftTypography> : " "
                              }
                              {fetchdata && fetchdata.application && 
                              fetchdata.application.map((apply) => (
                              <React.Fragment key={apply.pollid}> {/* Correctly using fragment with a key */}
                                <TimelineItem
                                  color={apply.status == 1 ? "info" : apply.status == 2 ? "primary" : "warning"}
                                  icon="inventory_2"
                                  title={apply.pollname || " "}
                                  // position={apply.position_name} 
                                  dateTime={apply.created_date || " "} 
                                  description={apply.position_name || " "}
                                  details={apply.platform || " "}
                                  badges={[
                                    apply.status == 1 ? "approved" : apply.status == 2 ? "rejected" : "pending"
                                  ]}
                                />
                                {access == 5 && apply.status == 0 &&
                                 <SoftBox mt={2} display="flex" justifyContent="end">
                                  <SoftButton onClick={() => handleDelete(apply)} className="text-xxs me-2 px-3 rounded-pill" size="small" variant="gradient" color="primary">
                                    <DeleteTwoToneIcon /> delete
                                  </SoftButton>
                                </SoftBox>
                                }
                               
                              </React.Fragment>
                              ))}
                          </TimelineList>
                        </Grid>
                    </Grid>
                </SoftBox>
            </Card>
        </SoftBox>
        <Footer />
      </DashboardLayout>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        limit={5}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        theme="light"
      />
    </>
    
  );
}

export default MyApplications;
