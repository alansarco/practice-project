// @mui material components
import Grid from "@mui/material/Grid";

// React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import 'chart.js/auto';
// React examples
import DashboardLayout from "essentials/LayoutContainers/DashboardLayout";
import DashboardNavbar from "essentials/Navbars";
import Footer from "essentials/Footer";
import { ToastContainer, toast } from 'react-toastify';

// React base styles

// Data
import DefaultDoughnutChart from "essentials/Charts/DoughnutCharts/DefaultDoughnutChart";
import VerticalBarChart from "essentials/Charts/BarCharts/VerticalBarChart";
import MiniStatisticsCard from "essentials/Cards/StatisticsCards/MiniStatisticsCard";
import TimelineList from "essentials/Timeline/TimelineList";
import TimelineItem from "essentials/Timeline/TimelineItem";

import React, { useState } from "react";
import { useDashboardData } from 'layouts/dashboard/data/dashboardRedux';
import { useStateContext } from "context/ContextProvider";
import { Navigate } from "react-router-dom";

function Dashboard() {
  const {token, access, updateTokenExpiration} = useStateContext();
  updateTokenExpiration();
  if (!token) {
    return <Navigate to="/authentication/sign-in" />
  }
  // else if(token && access < 999) {
  //   return <Navigate to="/not-found" />
  // }

  const { 
    authUser,
    otherStats , loadOtherStats,
    sales, loadSales,
  } = useDashboardData({
    authUser: true, 
    otherStats: true, 
    sales: true, 
  });  
  
  // Extract "sales" and "sale_count" into separate arrays
  const sale_label = sales.map(data => data.product_name);
  const sale_data = sales.map(data => data.product_sale);


  return (
    <>
      <DashboardLayout>
        <DashboardNavbar RENDERNAV="1" />         
        <SoftBox px={2} py={3}>
          <SoftBox px={2} py={1} mb={2}>
            {authUser != "" && <SoftTypography variant="h4">Welcome back, <span className="text-success text-gradient h4">{authUser.fullname}!</span> </SoftTypography>}
              <SoftTypography fontStyle="italic" color="inherit" fontSize="0.9rem">Sogod NHS - Online Voting System</SoftTypography>
          </SoftBox>
          <SoftBox mb={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={7} xl={8}>
                {access >= 999 && 
                  <>
                    <SoftTypography fontWeight="bold" color="success" textGradient fontSize="1rem">Accounts</SoftTypography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={8} md={5} xl={5}>
                        <MiniStatisticsCard
                          title={{ text: "Admins" }}
                          count={otherStats.data1 || 0} 
                          icon={{ color: "success", component: "lock" }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={8} md={5} xl={5}>
                        <MiniStatisticsCard
                          title={{ text: "Users" }}
                          count={otherStats.data2 || 0} 
                          icon={{ color: "success", component: "person" }}
                        />
                      </Grid>
                    </Grid>
                  </>
                }
                <SoftTypography mt={3} mb={1} fontWeight="bold" color="success" textGradient fontSize="1rem">Grade Level</SoftTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={8} md={10} xl={10}>
                    <DefaultDoughnutChart
                      title="Grade Level Distribution"
                      nodata={Object.values(otherStats).every(value => value === "0")}
                      loading={loadOtherStats}
                      chart={{
                        labels: ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],  
                        datasets: {
                          label: "Projects",
                          backgroundColors: ["dark", "success", "primary", "warning", "info", "error"],
                          data: [
                            otherStats.data7, 
                            otherStats.data8, 
                            otherStats.data9, 
                            otherStats.data10, 
                            otherStats.data11, 
                            otherStats.data12],
                        },
                      }}
                    />  
                  </Grid>
                </Grid>
                <SoftTypography mt={3} mb={1} fontWeight="bold" color="success" textGradient fontSize="1rem">Poll Charts</SoftTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={12} xl={12}>
                    <VerticalBarChart
                      title="SSG Election 2024"
                      nodata={sale_data.every(value => value === "0")}
                      height="20rem"
                      loading={loadSales}
                        chart={{
                        labels: sale_label,
                        datasets: [{
                          color: "dark",
                          data: sale_data
                        }],
                      }}
                    />  
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={5} xl={4}>
              <TimelineList title="Events and Announcements" loading={loadOtherStats} >
                {((otherStats && otherStats.upcomingevents && otherStats.pastevents) 
                && !otherStats.pastevents.length > 0 && !otherStats.upcomingevents.length > 0 ) ?
                  <SoftTypography mt={0} color="dark" fontSize="0.8rem" className="text-center">
                    None for Today!
                  </SoftTypography> : ""
                }
                {((otherStats && otherStats.upcomingevents) && otherStats.upcomingevents.length > 0) ?
                  <SoftTypography mt={0} fontWeight="bold" color="success" textGradient fontSize="1rem">
                    Active Events
                  </SoftTypography> : ""
                }
                {otherStats && otherStats.upcomingevents && 
                  otherStats.upcomingevents.map((event, index) => (
                    <TimelineItem
                      key={index} 
                      color={event.color}
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
                {((otherStats && otherStats.pastevents) && otherStats.pastevents.length > 0) ? 
                  <SoftTypography mt={0} fontWeight="bold" color="success" textGradient fontSize="1rem">
                    Recent Events
                  </SoftTypography> : ""
                }
                {otherStats && otherStats.pastevents && 
                  otherStats.pastevents.map((event, index) => (
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
        </SoftBox>
        <Footer />
      </DashboardLayout>
      <ToastContainer
        position="bottom-right"
        autoClose={false}
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

export default Dashboard;
