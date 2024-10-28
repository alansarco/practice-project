// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import 'chart.js/auto';
// React examples
import DashboardLayout from "essentials/LayoutContainers/DashboardLayout";
import DashboardNavbar from "essentials/Navbars";
import Footer from "essentials/Footer";
import { ToastContainer, toast } from 'react-toastify';

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

function MyVotes() {
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
      axios.get(apiRoutes.myVotes, {headers} )
        .then(response => {
          setFetchdata(response.data.myvotes);
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

  return (
    <>
      {reload && <FixedLoading /> }
      <DashboardLayout>
        <DashboardNavbar RENDERNAV={rendering} />       
        <SoftBox p={2}>
            <SoftBox className="px-md-4 px-3 py-2" display="flex" justifyContent="space-between" alignItems="center">
                <SoftBox>
                    <SoftTypography className="text-uppercase text-secondary" variant="h6" >My Votes</SoftTypography>
                </SoftBox>
            </SoftBox>
            <Card className="bg-white rounded-5">
                <SoftBox mb={3} p={2} >
                    <Grid container spacing={3}>
                        <Grid item xs={12} >
                          <SoftBox className="p-4">
                              {((fetchdata && fetchdata.myvotes) 
                              && !fetchdata.myvotes.length > 0) ?
                              <SoftTypography mt={0} color="dark" fontSize="0.8rem" className="text-center">
                                  You have no vote records!
                              </SoftTypography> : " "
                              }
                              {((fetchdata && fetchdata.myvotes) && fetchdata.myvotes.length > 0) ?
                              <SoftTypography mt={0} fontWeight="bold" color="success" textGradient fontSize="1rem">
                                  These are your recent votes
                              </SoftTypography> : " "
                              }
                              {fetchdata && fetchdata.myvotes && 
                              fetchdata.myvotes.map((apply, index) => (
                              <React.Fragment key={index}> {/* Correctly using fragment with a key */}
                                <SoftTypography className="fw-bold mt-3 text-gradient text-info"  >{apply.pollname}</SoftTypography>
                                <SoftTypography className="fw-bold text-xxs fst-italic mb-2 text-gradient text-dark"  >{apply.last_vote_time}</SoftTypography>

                                  {apply.myvotes.split('; ').map((vote, index) => (
                                      <SoftTypography className="text-sm" key={index}>{vote}</SoftTypography>
                                  ))}
                               
                              </React.Fragment>
                              ))}
                            </SoftBox>
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

export default MyVotes;
