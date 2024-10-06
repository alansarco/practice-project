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

function Information({USER, HandleRendering, ReloadTable}) {
  const [deleteUser, setDeleteUser] = useState(false);
  const currentFileName = "layouts/users/components/UserContainer/index.js";

  const username = USER.username;
  const {token, role, access} = useStateContext();  
  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
    'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
  };

  const handleCancel = () => {
    HandleRendering(1);
    ReloadTable();
  };

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
      title: 'Delete Student?',
      text: "Are you sure you want to delete this data? You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',  
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setDeleteUser(true);
          if (!token) {
            toast.error(messages.prohibit, { autoClose: true });
          }
          else {  
            axios.get(apiRoutes.accountDelete, { params: { username }, headers })
              .then(response => {
                if (response.data.status == 200) {
                  toast.success(`${response.data.message}`, { autoClose: true });
                } else {
                  toast.error(`${response.data.message}`, { autoClose: true });
                }
                passToSuccessLogs(response.data, currentFileName);
                HandleRendering(1);
                ReloadTable();
                setDeleteUser(false);
              })  
              .catch(error => {
                setDeleteUser(false);
                toast.error("Cant delete user", { autoClose: true });
                passToErrorLogs(error, currentFileName);
              });
          }
      }
    })
  };


  return (
    <>  
      {deleteUser && <FixedLoading /> }
      <SoftBox mt={5} mb={3} px={3}>
        <SoftBox p={4} className="shadow-sm rounded-4 bg-white" >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} xl={6}>
              <ProfileInfoCard
                title="Personal Information"
                info={{
                  Firstname: USER.name,
                  Grade: USER.grade == null ? " " : USER.grade,
                  Section: USER.section == null ? " " : USER.section,
                  Track: USER.track == null ? "N/A" : USER.track,
                  Course: USER.course == null ? "N/A" : USER.course,
                  Gender: USER.gender == null ? " " : USER.gender,
                  Birthday: USER.birthday == null ? " " : USER.birthday,
                  Mobile: USER.contact == null ? " " : USER.contact,
                  Religion: USER.religion == null ? " " : USER.religion,
                  Modality: USER.modality == null ? " " : USER.modality,
                  Password_Change: USER.password_change == "1" ? "Yes" : "No",
                  Date_Added: USER.date_added,
                  Last_Online: USER.last_online,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={6}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12} xl={12}>
                  <ProfileInfoCard
                    title="Address Information"
                    info={{
                      House_No: USER.house_no == null ? " " : USER.house_no,
                      Barangay: USER.barangay == null ? " " : USER.barangay,
                      Municipality: USER.municipality == null ? " " : USER.municipality,
                      Province: USER.province == null ? " " : USER.province,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={12} xl={12}>
                  <ProfileInfoCard
                    title="Emergency Contact"
                    info={{
                      Father: USER.father_name == null ? " " : USER.father_name,
                      Mother: USER.mother_name == null ? " " : USER.mother_name,
                      Guardian: USER.guardian == null ? "N/A" : USER.guardian,
                      Contact: USER.contact_rel == null ? " " : USER.contact_rel,
                    }}
                  />
                </Grid>
              </Grid>
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
            {access >= 10 && role === "ADMIN" && 
            <Grid item xs={12} sm={4} md={2} pl={1}>
              <SoftBox mt={2} display="flex" justifyContent="end">
                <SoftButton onClick={handleDelete} variant="gradient" color="success" className="mx-2 w-100" size="small">
                  Delete
                </SoftButton>
              </SoftBox>
            </Grid>}
          </Grid>   
        </SoftBox>
      </SoftBox>
    </>
  );
}

export default Information;
