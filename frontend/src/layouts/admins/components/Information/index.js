// @mui material components
import Grid from "@mui/material/Grid";

// React components
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import { toast } from "react-toastify";
// import Swal from "assets/sweetalert/sweetalert.min.js";

// React examples
import ProfileInfoCard from "essentials/Cards/InfoCards/ProfileInfoCard";
import { useStateContext } from "context/ContextProvider";
import { passToSuccessLogs, passToErrorLogs } from "components/Api/Gateway";
import { apiRoutes } from "components/Api/ApiRoutes";
import { useState } from "react";
import FixedLoading from "components/General/FixedLoading"; 
import { messages } from "components/General/Messages";
import axios from "axios";  
import { genderSelect } from "components/General/Utils";

function Information({USER, HandleRendering, ReloadTable}) {  
  const {token, role, access} = useStateContext();  
  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
    'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
  };

  const handleCancel = () => {
    HandleRendering(1);
    ReloadTable();
  };

  return (
    <>  
      <SoftBox mt={5} mb={3} px={3}>
        <SoftBox p={4} className="shadow-sm rounded-4 bg-white" >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} xl={4}>
              <ProfileInfoCard
                title="Account Information"
                info={{
                  Name: USER.name,  
                  Contact: USER.contact == null ? " " : USER.contact,
                  Gender: USER.gender == null ? " " : USER.gender,
                  Birthday: USER.birthdate == null ? " " : USER.birthdate ,
                  Date_Added: USER.date_added,
                  Last_Online: USER.last_online,
                }}
              />
            </Grid>
          </Grid>
          <Grid mt={3} container spacing={0} alignItems="center" justifyContent="end">
            <Grid item xs={12} sm={4} md={2} pl={1}>
              <SoftBox mt={2} display="flex" justifyContent="end">
                <SoftButton onClick={handleCancel} className="mx-2 w-100" size="small" color="light">
                  Back
                </SoftButton>
              </SoftBox>
            </Grid>
          </Grid>   
        </SoftBox>
      </SoftBox>
    </>
  );
}

export default Information;
