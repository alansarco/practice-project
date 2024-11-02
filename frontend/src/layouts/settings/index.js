// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// React components
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import 'chart.js/auto';
import BorderColorTwoToneIcon from '@mui/icons-material/BorderColorTwoTone';

// React examples
import DashboardLayout from "essentials/LayoutContainers/DashboardLayout";
import DashboardNavbar from "essentials/Navbars";
import Footer from "essentials/Footer";
import { ToastContainer, toast } from 'react-toastify';
import FixedLoading from "components/General/FixedLoading";
import { passToSuccessLogs, passToErrorLogs } from "components/Api/Gateway";

import { yesnoSelect } from "components/General/Utils";
import React, { useState, useEffect } from "react";
import { useStateContext } from "context/ContextProvider";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";
import { messages } from "components/General/Messages";

function Settings() {
  const currentFileName = "layouts/announcements/index.js";
  const { token, access, role, updateTokenExpiration } = useStateContext();
  updateTokenExpiration();

  if (!token) {
    return <Navigate to="/authentication/sign-in" />;
  }

  const headers = {
    'Authorization': `Bearer ${token}`
  };

  const [reload, setReload] = useState(true);
  const [edit, setEdit] = useState(false);
  const [fetchdata, setFetchdata] = useState([]);

  const initialState = {
    schoolid: "",
    security_code: "",
    superadmin_limit: "",
    event_notif: "",
    agreement: false,
  };

  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? !formData[name] : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    const requiredFields = [
      "security_code", 
      "superadmin_limit",
      "event_notif",
    ];

    const emptyRequiredFields = requiredFields.filter(field => !formData[field]);

    if (emptyRequiredFields.length === 0) {
      if (!formData.agreement) {
        toast.warning(messages.agreement, { autoClose: true });
      } 
      else {
        setReload(true);
        try {
          if (!token) {
            toast.error(messages.prohibit, { autoClose: true });
          } else {
            const response = await axios.post(apiRoutes.updateSettings, formData, { headers });
            if (response.data.status === 200) {
              toast.success(`${response.data.message}`, { autoClose: true });
              setEdit(false);
              // setFormData(initialState);
            } else {
              toast.error(`${response.data.message}`, { autoClose: true });
            }
            passToSuccessLogs(response.data, currentFileName);
          }
        } catch (error) {
          toast.error("Error submitting data.", { autoClose: true });
          passToErrorLogs(error, currentFileName);
        }
        setReload(false);
      }
    } else {
      toast.warning("Please fill in all required fields.", { autoClose: true });
    }
  };

  const reloadTable = () => {
    axios.get(apiRoutes.retrieveSettings, { headers })
      .then(response => {
        setFetchdata(response.data.settings);
        passToSuccessLogs(response.data, currentFileName);
        setReload(false);
      })
      .catch(error => {
        passToErrorLogs(`Settings not Fetched!  ${error}`, currentFileName);
        setReload(false);
      });
  };

  useEffect(() => {
    if (reload) {
      setReload(true);
      reloadTable();
    }
  }, [reload]);

  useEffect(() => {
    if (fetchdata && fetchdata.length > 0) {
      setFormData({
        schoolid: fetchdata[0].school_id || "",
        security_code: fetchdata[0].security_code || "",
        superadmin_limit: fetchdata[0].superadmin_limit || "",
        event_notif: fetchdata[0].event_notif || "",
        agreement: fetchdata[0].agreement || false,
      });
    }
  }, [fetchdata]);

  return (
    <>
      {reload && <FixedLoading />}
      <DashboardLayout>
        <DashboardNavbar RENDERNAV={edit} />
        <SoftBox p={2}>
          <SoftBox className="px-md-4 px-3 py-2" display="flex" justifyContent="space-between" alignItems="center">
            <SoftBox>
              <SoftTypography className="text-uppercase text-secondary" variant="h6">System Settings</SoftTypography>
            </SoftBox>
            <SoftBox display="flex">
              {access >= 999 && role === "ADMIN" && !edit &&
                <SoftButton onClick={() => setEdit(true)} className="ms-2 py-0 px-3 d-flex rounded-pill" variant="gradient" color="success" size="small">
                  <BorderColorTwoToneIcon className="me-1" /> Edit Settings
                </SoftButton>
              }
            </SoftBox>
          </SoftBox>
          <Card className="bg-white rounded-5">
            <SoftBox mt={2} p={2} pb={4}>
              <SoftBox component="form" role="form" className="px-md-0 px-2" onSubmit={handleSubmit}>
                <SoftTypography fontWeight="medium" textTransform="capitalize" color="success" textGradient>
                  Settings
                </SoftTypography>
                <Grid container spacing={0} alignItems="center">
                  <Grid item xs={12} md={6} lg={3} px={1}>
                    <SoftTypography variant="button" className="me-1">Security Code:</SoftTypography>
                    <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                    <SoftInput disabled={!edit} name="security_code" value={formData.security_code} onChange={handleChange} size="small" />
                  </Grid>
                  <Grid item xs={12} md={6} lg={3} px={1}>
                    <SoftTypography variant="button" className="me-1">Super Admin Limit:</SoftTypography>
                    <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                    <SoftInput disabled={!edit} type="number" name="superadmin_limit" value={formData.superadmin_limit} onChange={handleChange} size="small" />
                  </Grid>
                  <Grid item xs={12} md={6} lg={3} px={1}>
                    <SoftTypography variant="button" className="me-1"> Event Notification: </SoftTypography>
                    <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                    <select disabled={!edit} className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer" name="event_notif" value={formData.event_notif} onChange={handleChange} >
                          <option value=""></option>
                          {yesnoSelect && yesnoSelect.map((choice) => (
                          <option key={choice.value} value={choice.value}>
                                {choice.desc}
                          </option>
                          ))}
                    </select>
                </Grid>
                </Grid>
                {edit &&
                <>
                <Grid mt={3} container spacing={0} alignItems="center">
                  <Grid item xs={12} pl={1}>
                    <Checkbox
                      className={`${formData.agreement ? '' : 'border-2 border-success'}`}
                      name="agreement"
                      checked={formData.agreement}
                      onChange={handleChange}
                    />
                    <SoftTypography variant="button" className="me-1 ms-2">Verify Data</SoftTypography>
                    <SoftTypography variant="p" className="text-xxs text-secondary fst-italic">(Confirming that the information above is true and accurate)</SoftTypography>
                    <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                  </Grid>
                </Grid>
                <Grid mt={3} container spacing={0} alignItems="center" justifyContent="end">
                  <Grid item xs={12} sm={4} md={2} pl={1}>
                    <SoftBox mt={2} display="flex" justifyContent="end">
                    <SoftButton onClick={() => setEdit(false)} className="ms-2 py-0 px-3 d-flex rounded-pill" variant="gradient" color="secondary" size="small">
                      Cancel Edit
                    </SoftButton>
                    </SoftBox>
                  </Grid>
                  <Grid item xs={12} sm={4} md={2} pl={1}>
                    <SoftBox mt={2} display="flex" justifyContent="end">
                      <SoftButton variant="gradient" type="submit" className="mx-2 w-100 text-xxs px-3 rounded-pill" size="small" color="success">
                        Save
                      </SoftButton>
                    </SoftBox>
                  </Grid>
                </Grid>
                </>
                }
              </SoftBox>
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

export default Settings;
