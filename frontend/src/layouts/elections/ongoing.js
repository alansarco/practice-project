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
import Table from "layouts/elections/data/ongoingtable";
import { tablehead } from "layouts/elections/data/head";

// Data
  import { Grid } from "@mui/material";
import { DynamicTableHeight } from "components/General/TableHeight";

import React, { useEffect, useState } from "react";
import FixedLoading from "components/General/FixedLoading";
import { useStateContext } from "context/ContextProvider";
import { Navigate } from "react-router-dom";
import Add from "layouts/elections/components/Add";
import Edit from "layouts/elections/components/Edit";
import axios from "axios";
import { passToSuccessLogs, passToErrorLogs } from "components/Api/Gateway";
import { apiRoutes } from "components/Api/ApiRoutes";
import { useDashboardData } from 'layouts/dashboard/data/dashboardRedux';

function Ongoing() {
  const currentFileName = "layouts/elections/index.js";
  const {token, access, updateTokenExpiration, role} = useStateContext();
  updateTokenExpiration();
  if (!token) {
    return <Navigate to="/authentication/sign-in" />
  }
  
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [filter, setFilter] = useState();
  const [reload, setReload] = useState(false);
  const [fetching, setFetching] = useState("");

  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
    'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
  };
  
  const [data, setDATA] = useState(); 
  const [rendering, setRendering] = useState(1);
  const [pollinfo, setProjectInfo] = useState();
  const [fetchdata, setFetchdata] = useState([]);
  const {polls, loadPolls} = useDashboardData({polls: true}, []);  

  useEffect(() => {
    if (!loadPolls && polls) {
      setFetchdata(polls.filter(poll => poll.status === "ongoing" && poll.allowed === "yes"), []);
    }
  }, [polls, loadPolls]);

  const tableHeight = DynamicTableHeight();
  
  const HandleDATA = (election) => {
    setDATA(election);
  };

  const HandleNullProject = (info) => {
    setProjectInfo(info);
  };

  const HandleRendering = (rendering) => {
    setRendering(rendering);
  };
  
  const handleSearchAndButtonClick = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault(); // Prevent form submission
      const inputElement = document.getElementById('yourInputId');
      const inputValue = inputElement.value;
      setFilter(inputValue);
      setSearchTriggered(true);
    }
  };
  
  useEffect(() => {
    if (searchTriggered) {
      setReload(true);
      axios.get(apiRoutes.pollsRetrieve, { params: { filter }, headers })
        .then(response => {
          const retrieved = response.data.polls.filter(
            poll => poll.status === "ongoing" && 
            poll.allowed === "yes"
          )
          setFetchdata(retrieved);
          passToSuccessLogs(response.data, currentFileName);
          if(retrieved.length < 1) setFetching("No data Found!")        
          setReload(false);
        })
        .catch(error => {
          passToErrorLogs(`Elections Data not Fetched!  ${error}`, currentFileName);
          setReload(false);
        });
      setSearchTriggered(false);
    }
  }, [searchTriggered]);

  useEffect(() => {
    if(data) {
      setReload(true);
      axios.get(apiRoutes.projectInfo, { params: { data }, headers })
      .then(response => {
          setProjectInfo(response.data.polls);
          passToSuccessLogs(response.data, currentFileName);
          setReload(false);
      })    
      .catch(error => {
          passToErrorLogs(`Election Data not Fetched!  ${error}`, currentFileName);
          setReload(false);
      });
    }
  }, [data]);

  return (
    <> 
      {loadPolls && <FixedLoading />} 
      {reload && <FixedLoading />} 
      <DashboardLayout>
        <DashboardNavbar RENDERNAV={rendering} />
        {data && pollinfo && rendering == 2 ? 
            <Edit PROJECT={pollinfo} HandleNullProject={HandleNullProject}  HandleRendering={HandleRendering} HandleDATA={HandleDATA} /> 
          :
          rendering == 3 ?
            <Add HandleRendering={HandleRendering} />
        :
        <SoftBox p={2}>
          <SoftBox >   
            <SoftBox className="px-md-4 px-3 py-2" display="flex" justifyContent="space-between" alignItems="center">
              <SoftBox>
                <SoftTypography className="text-uppercase text-secondary" variant="h6" >Ongoing Elections</SoftTypography>
              </SoftBox>
            </SoftBox>
            <Card className="px-md-4 px-2 pt-3 pb-md-5 pb-4">
              <Grid container spacing={1} py={1} pb={2}>  
                <Grid item xs={12} md={8} display="flex">
                  {access >= 10 && role === "ADMIN" ?
                  <SoftTypography className="text-xs my-auto px-2 text-dark">
                    <b className="text-success">Note:</b> Once the election is <b>ONGOING</b>, you can no longer update and delete them.
                  </SoftTypography>
                  : 
                  <SoftTypography className="text-xs my-auto px-2 text-dark">
                    <b className="text-success">Note:</b> Elections displayed here are those you can only participate with.
                  </SoftTypography>
                  }
                </Grid>   
                <Grid item xs={12} md={4}>
                  <SoftBox className="px-md-0 px-2" display="flex" margin="0" justifyContent="end">
                        <SoftInput
                          placeholder="Search here..."
                          icon={{
                            component: 'search',
                            direction: 'right',
                          }}
                          size="small"
                          onKeyDown={handleSearchAndButtonClick}
                          id="yourInputId" // Add an ID to the input element
                        />
                        <SoftButton
                          className="px-3 rounded-0 rounded-right"
                          variant="gradient"
                          color="success"
                          size="medium"
                          iconOnly
                          onClick={handleSearchAndButtonClick}
                        >
                          <Icon>search</Icon>
                        </SoftButton>
                      </SoftBox>
                </Grid>
              </Grid>
              <SoftBox className="shadow-none table-container px-md-1 px-3 bg-gray rounded-5" height={tableHeight} minHeight={50}>
                  {fetchdata && fetchdata.length > 0 ? 
                    <Table table="sm" HandleDATA={HandleDATA} HandleRendering={HandleRendering} elections={fetchdata} tablehead={tablehead} /> :
                    <>
                    <SoftBox className="d-flex" height="100%">
                      <SoftTypography variant="h6" className="m-auto text-secondary">   
                      {fetching}              
                      </SoftTypography>
                    </SoftBox>
                    </>
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

export default Ongoing;