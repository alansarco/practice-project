// @mui material components
import Card from "@mui/material/Card";

// React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import SoftButton from "components/SoftButton";
import { ToastContainer, toast } from 'react-toastify';
import { Link } from 'react-router-dom';

import Icon from "@mui/material/Icon";
import FilterListIcon from '@mui/icons-material/FilterList';
import FileCopyIcon from '@mui/icons-material/FileCopy';
  
// React examples
import DashboardLayout from "essentials/LayoutContainers/DashboardLayout";
import DashboardNavbar from "essentials/Navbars"; 
import Footer from "essentials/Footer";
import Table from "layouts/requests/data/table";
import { tablehead } from "layouts/requests/data/head";

// Data
  import { Grid } from "@mui/material";
import { DynamicTableHeight } from "components/General/TableHeight";

import React, { useEffect, useState } from "react";
import FixedLoading from "components/General/FixedLoading";
import { useStateContext } from "context/ContextProvider";
import { Navigate } from "react-router-dom";

import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";
import { passToErrorLogs } from "components/Api/Gateway";
import { passToSuccessLogs } from "components/Api/Gateway";
import { useRequestsData } from "./data/requestRedux";
import Edit from "layouts/requests/components/Edit";

function Requests() {
  const currentFileName = "layouts/requests/index.js";
  const {token, access, role, updateTokenExpiration} = useStateContext();
  updateTokenExpiration();
  if (!token) {
    return <Navigate to="/authentication/sign-in" />
  }
  else if(token && access < 10) {
    return <Navigate to="/user-app" />
  }
  
  const [reload, setReload] = useState(false);

  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
    'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
  };

  const tableHeight = DynamicTableHeight();
  
  const [data, setDATA] = useState(); 
  const [rendering, setRendering] = useState(1);
  const {requests, isLoading} = useRequestsData({ requests: rendering }, []);
  const [requestorinfo, setRequestorInfo] = useState();
  const [captain, setCaptain] = useState();

  const HandleDATA = (officer) => {
    setDATA(officer);
  };

  const HandleRendering = (rendering) => {
    setRendering(rendering);
  };

  const HandleNullRequestor = (info) => {
    setRequestorInfo(info);
  };

  useEffect(() => {
    if (data) {
      setReload(true);
      axios.get(apiRoutes.requestorInfo, { params: { data }, headers })
        .then(response => {
          if (response.data.status === 200) {
            setRequestorInfo(response.data.requestor_info);  
            setCaptain(response.data.official);  
          } else {
            toast.error(`${response.data.message}`, { autoClose: true });
          }
          passToSuccessLogs(response.data, currentFileName);
          setReload(false);
        })  
        .catch(error => {
          passToErrorLogs(`Requestor info  not Fetched!  ${error}`, currentFileName);
          setReload(false);
        });
    }
  }, [data]);
  
  return (
    <> 
      {isLoading && <FixedLoading />} 
      {reload && <FixedLoading />} 
      <DashboardLayout>
        <DashboardNavbar RENDERNAV={rendering}/> 
        {requestorinfo && rendering == 2 ? 
            <Edit REQUESTOR={requestorinfo} CAPTAIN={captain} HandleNullRequestor={HandleNullRequestor} HandleDATA={HandleDATA} HandleRendering={HandleRendering} />       
          :
        <SoftBox p={2}>
          <SoftBox >   
            <SoftBox className="px-md-4 px-3 py-2" display="flex" justifyContent="space-between" alignItems="center">
              <SoftBox>
                <SoftTypography className="text-uppercase text-secondary" variant="h6" >List of Orders</SoftTypography>
              </SoftBox>
            </SoftBox>
            <Card className="px-md-4 px-2 pt-3 pb-md-5 pb-4">
              <SoftBox className="shadow-none table-container px-md-1 px-3 bg-gray rounded-5" height={tableHeight} minHeight={200}>
                {requests && requests.length > 0 ? 
                  <Table table="sm" HandleDATA={HandleDATA} HandleRendering={HandleRendering} requests={requests} tablehead={tablehead} /> :
                  <SoftBox className="d-flex" height="100%">
                    <SoftTypography variant="h6" className="m-auto text-secondary"> 
                      {!isLoading && "No data found!"}
                    </SoftTypography>
                  </SoftBox>
                }
              </SoftBox>
            </Card>
          </SoftBox>
        </SoftBox>
          }
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

export default Requests;