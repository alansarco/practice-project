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
      <SoftBox mt={5} mb={3} px={2}>
        <SoftBox p={4} className="shadow-sm rounded-4 bg-white" >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ProfileInfoCard
                title="Account Information"
                info={{
                  Name: USER.name,  
                  Contact: USER.contact == null ? " " : USER.contact,
                  Gender: USER.gender == null ? " " : USER.gender,
                  Role: USER.access_level == null ? " " : USER.access_level == 999 ? "Super Admin" : "Admin",
                  Birthdate: USER.birthday == null ? " " : USER.birthday ,
                  Last_Online: USER.last_online,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ProfileInfoCard
                  title="Other Information"
                  info={{
                  Updated_Date: USER.created_date == null ? " " : USER.created_date,
                  Updated_By: USER.updated_by == null ? " " : USER.updated_by,
                  Created_Date: USER.created_date == null ? " " : USER.created_date,
                  Created_by: USER.created_by == null ? " " : USER.created_by,
                  }}
              />
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
          </Grid>   
        </SoftBox>
      </SoftBox>
    </>
  );
}

export default Information;
