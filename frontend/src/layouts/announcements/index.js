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
import Icon from "@mui/material/Icon";
import BorderColorTwoToneIcon from '@mui/icons-material/BorderColorTwoTone';
// Data
import TimelineList from "essentials/Timeline/TimelineList";
import TimelineItem from "essentials/Timeline/TimelineItem";
import Add from "layouts/announcements/components/Add";
import Edit from "layouts/announcements/components/Edit";
import FixedLoading from "components/General/FixedLoading";
import { passToSuccessLogs, passToErrorLogs } from "components/Api/Gateway";

import React, { useState, useEffect } from "react";
import { useDashboardData } from 'layouts/dashboard/data/dashboardRedux';
import { useStateContext } from "context/ContextProvider";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";

function Announcements() {
  const currentFileName = "layouts/announcements/index.js";
  const {token, access, role, updateTokenExpiration} = useStateContext();
  updateTokenExpiration();
  if (!token) {
    return <Navigate to="/authentication/sign-in" />
  }

  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
        'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
  };

  const [DATA, setRetrieveOne] = useState(); 
  const [reload, setReload] = useState(false);
  const [rendering, setRendering] = useState(1);
  const [fetchdata, setFetchdata] = useState([]);
  const [searchTriggered, setSearchTriggered] = useState(true);

  const { 
    authUser,
    otherStats , loadOtherStats,
  } = useDashboardData({
    authUser: true, 
    rendering,
    otherStats: true, 
  }); 

  const HandleRendering = (rendering) => {
    setRendering(rendering);
  };

  const handleUpdate = (id) => {
    setReload(true);
    axios.get(apiRoutes.retrieveAnnouncementOne, { params: { id }, headers })
      .then(response => {
        if (response.data.status === 200) {
          setRendering(2);
          setRetrieveOne(response.data.calendar);  
        } else {
          toast.error(`${response.data.message}`, { autoClose: true });
        }
        passToSuccessLogs(response.data, currentFileName);
        setReload(false);
      })  
      .catch(error => {
        passToErrorLogs(`Event not Fetched!  ${error}`, currentFileName);
        setReload(false);
      });
  };

  const ReloadTable = () => {
    axios.get(apiRoutes.retrieveAnnouncement, {headers} )
    .then(response => {
      setFetchdata(response.data.calendars);
      passToSuccessLogs(response.data, currentFileName);
      setReload(false);
    })
    .catch(error => {
      passToErrorLogs(`Calendars not Fetched!  ${error}`, currentFileName);
      setReload(false);
    });
  }

  useEffect(() => {
    if (searchTriggered) {
      setReload(true);
      axios.get(apiRoutes.retrieveAnnouncement, {headers} )
        .then(response => {
          setFetchdata(response.data.calendars);
          passToSuccessLogs(response.data, currentFileName);
          setReload(false);
        })
        .catch(error => {
          passToErrorLogs(`Calendars not Fetched!  ${error}`, currentFileName);
          setReload(false);
        });
        setSearchTriggered(false);
    }
  }, [searchTriggered]);

  const handleDelete = async (id) => {
    Swal.fire({
      customClass: {
        title: 'alert-title',
        icon: 'alert-icon',
        confirmButton: 'alert-confirmButton',
        cancelButton: 'alert-cancelButton',
        container: 'alert-container',
        popup: 'alert-popup'
      },
      title: 'Delete Announcent?',
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
            axios.get(apiRoutes.deleteAnnouncement, { params: { id }, headers })
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
                toast.error("Cant delete announcement!", { autoClose: true });
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
        {DATA && rendering == 2 ? 
            <Edit DATA={DATA} HandleRendering={HandleRendering} ReloadTable={ReloadTable} />       
          :
          rendering == 3 ?
            <Add HandleRendering={HandleRendering} ReloadTable={ReloadTable}  />
        :   
        <SoftBox p={2}>
            <SoftBox className="px-md-4 px-3 py-2" display="flex" justifyContent="space-between" alignItems="center">
                <SoftBox>
                    <SoftTypography className="text-uppercase text-secondary" variant="h6" >Announcements and Events List</SoftTypography>
                </SoftBox>
                <SoftBox display="flex">
                    {access >= 10 && role === "ADMIN" && 
                    <SoftButton onClick={() => setRendering(3)} className="ms-2 py-0 px-3 d-flex rounded-pill" variant="gradient" color="success" size="small" >
                      <Icon>add</Icon> Add Election
                    </SoftButton>
                    }
                    
                </SoftBox>
            </SoftBox>
            <Card className="bg-white rounded-5">
                <SoftBox mb={3} p={2} >
                    <Grid container spacing={3}>
                        <Grid item xs={12} >
                          <TimelineList shadow="shadow-none" className="bg-success" title="Please be guided with school announcements and events. Make sure to participate."  >
                              {((fetchdata && fetchdata.upcomingevents && fetchdata.pastevents) 
                              && !fetchdata.pastevents.length > 0 && !fetchdata.upcomingevents.length > 0 ) ?
                              <SoftTypography mt={0} color="dark" fontSize="0.8rem" className="text-center">
                                  None for Today!
                              </SoftTypography> : ""
                              }
                              {((fetchdata && fetchdata.upcomingevents) && fetchdata.upcomingevents.length > 0) ?
                              <SoftTypography mt={0} fontWeight="bold" color="success" textGradient fontSize="1rem">
                                  Active Events
                              </SoftTypography> : ""
                              }
                              {fetchdata && fetchdata.upcomingevents && 
                              fetchdata.upcomingevents.map((event) => (
                              <React.Fragment key={event.id}> {/* Correctly using fragment with a key */}
                                <TimelineItem
                                  color={event.color}
                                  icon="payment"
                                  title={event.event_name}
                                  dateTime={event.event_datetime} 
                                  description={event.description}
                                  details={event.details}
                                  badges={[
                                    event.hashtag1,
                                    event.hashtag2,
                                    event.hashtag3,
                                  ]}
                                />
                                {access >= 10 && role === "ADMIN" &&
                                 <SoftBox mt={2} display="flex" justifyContent="end">
                                  <SoftButton onClick={() => handleDelete(event.id)} className="text-xxs me-2 px-3 rounded-pill" size="small" variant="gradient" color="primary">
                                    <DeleteTwoToneIcon /> delete
                                  </SoftButton>
                                  <SoftButton onClick={() => handleUpdate(event.id)} className="text-xxs me-2 px-3 rounded-pill" size="small" variant="gradient" color="dark">
                                    <BorderColorTwoToneIcon /> edit
                                  </SoftButton>
                                </SoftBox>
                                }
                               
                              </React.Fragment>
                              )
                              )}
                              {((fetchdata && fetchdata.pastevents) && fetchdata.pastevents.length > 0) ? 
                              <SoftTypography mt={0} fontWeight="bold" color="success" textGradient fontSize="1rem">
                                  Recent Events
                              </SoftTypography> : ""
                              }
                              {fetchdata && fetchdata.pastevents && 
                              fetchdata.pastevents.map((event, index) => (
                                  <TimelineItem
                                  key={index} 
                                  color="secondary"
                                  icon="payment"
                                  title={event.event_name}
                                  dateTime={event.event_datetime} 
                                  description={event.description}
                                  badges={[
                                      event.hashtag1,
                                      event.hashtag2,
                                      event.hashtag3,
                                  ]}
                                  />
                              )
                              )}
                          </TimelineList>
                        </Grid>
                    </Grid>
                </SoftBox>
            </Card>
        </SoftBox>
        }
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

export default Announcements;
