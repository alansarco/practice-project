// @mui material components
import Card from "@mui/material/Card";

// React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import SoftButton from "components/SoftButton";
import { ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';

import Icon from "@mui/material/Icon";
import FilterListIcon from '@mui/icons-material/FilterList';
import FileCopyIcon from '@mui/icons-material/FileCopy';

// React examples
import DashboardLayout from "essentials/LayoutContainers/DashboardLayout";
import DashboardNavbar from "essentials/Navbars"; 
import Footer from "essentials/Footer";

// Data
import { Grid } from "@mui/material";
import { DynamicTableHeight } from "components/General/TableHeight";

import React, { useEffect, useState } from "react";
import FixedLoading from "components/General/FixedLoading"; 
import { useStateContext } from "context/ContextProvider";
import { Navigate } from "react-router-dom";
import UserContainer from "layouts/users/components/UserContainer";
import Add from "layouts/users/components/Add";

import Table from "layouts/users/data/table";
import { tablehead } from "layouts/users/data/head";  
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";
import { passToErrorLogs } from "components/Api/Gateway";
import { passToSuccessLogs } from "components/Api/Gateway";
import CustomPagination from "components/General/CustomPagination";

function Blank() {
  const currentFileName = "layouts/users/index.js";
  const {token, access, updateTokenExpiration} = useStateContext();
  updateTokenExpiration();
  if (!token) {
    return <Navigate to="/authentication/sign-in" />
  }
  

  return (
    <> 
      <DashboardLayout>
        <DashboardNavbar/> 
            <SoftBox p={2}>
            <SoftBox >   
              {/* <SoftBox className="px-md-4 px-3 py-2" display="flex" justifyContent="space-between" alignItems="center">
                <SoftBox>
                  <SoftTypography className="text-uppercase text-secondary" variant="h6" >Student Users List</SoftTypography>
                </SoftBox>
              </SoftBox> */}
              <Card className="px-md-4 px-2 pt-3 pb-md-3 pb-2">
                <Grid container spacing={1} py={1} pb={2}>  
                  <Grid item xs={12} md={8} display="flex">
                    <SoftTypography className="h4 my-auto px-2 text-dark">
                      These page is in under progress.
                    </SoftTypography>
                  </Grid> 
                </Grid>
              </Card>
            </SoftBox>
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

export default Blank;