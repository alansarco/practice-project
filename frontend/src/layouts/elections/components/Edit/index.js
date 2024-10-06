// React components
import { Checkbox, Grid } from "@mui/material";
import FixedLoading from "components/General/FixedLoading";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftInput from "components/SoftInput";
import SoftTypography from "components/SoftTypography";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { messages } from "components/General/Messages";
import { useStateContext } from "context/ContextProvider";
import { passToErrorLogs, passToSuccessLogs  } from "components/Api/Gateway";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";

function Edit({HandleRendering, PROJECT, HandleNullProject, HandleDATA}) {
      const currentFileName = "layouts/elections/components/Edit/index.js";
      const [submitProfile, setSubmitProfile] = useState(false);
      const {token} = useStateContext();  
      const projectid = PROJECT.projectid;

      const YOUR_ACCESS_TOKEN = token; 
      const headers = {
            'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
      };

      const initialState = {
            projectid: PROJECT.projectid,
            title: PROJECT.title,
            description: PROJECT.description == null ? "" : PROJECT.description,
            budget: PROJECT.budget == null ? "0" : PROJECT.budget,
            status: PROJECT.status == null ? "" : PROJECT.status,
            price: PROJECT.price == null ? "0" : PROJECT.price,
            agreement: false,   
      };

      const [formData, setFormData] = useState(initialState);

      const handleChange = (e) => {
            const { name, value, type } = e.target;
            if (type === "checkbox") {
                  setFormData({ ...formData, [name]: !formData[name]});
            } else {
                  setFormData({ ...formData, [name]: value });
            }
      };

      const handleCancel = () => {
            HandleRendering(1); 
            HandleNullProject(null); 
            HandleDATA(null); 
      };
            
      const handleSubmit = async (e) => {
            e.preventDefault(); 
            toast.dismiss();
            // Check if all required fields are empty
            const requiredFields = [
                  "title", 
                  "price", 
            ];
            const emptyRequiredFields = requiredFields.filter(field => !formData[field]);

            if (emptyRequiredFields.length === 0) {
                  if(!formData.agreement) {
                        toast.warning(messages.agreement, { autoClose: true });
                  }
                  else {
                        setSubmitProfile(true);
                        try {
                              if (!token) {
                                    toast.error(messages.prohibit, { autoClose: true });
                              }
                              else {  
                                    const response = await axios.post(apiRoutes.editProject, formData, {headers});
                                    if(response.data.status == 200) {
                                          toast.success(`${response.data.message}`, { autoClose: true });
                                          HandleRendering(1);
                                          HandleNullProject(null); 
                                          HandleDATA(null);
                                    } else {
                                          toast.error(`${response.data.message}`, { autoClose: true });
                                    }
                                    passToSuccessLogs(response.data, currentFileName);
                              }
                        } catch (error) { 
                              toast.error(messages.operationError, { autoClose: true });
                              passToErrorLogs(error, currentFileName);
                        }     
                        setSubmitProfile(false);
                  }
                  
            } else {
                  // Display an error message or prevent form submission
                  toast.warning(messages.required, { autoClose: true });
            }
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
              title: 'Delete Election?',
              text: "You won't be able to revert this!",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',  
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
              if (result.isConfirmed) {
                  setSubmitProfile(true);
                  if (!token) {
                    toast.error(messages.prohibit, { autoClose: true });
                  }
                  else {  
                    axios.get(apiRoutes.deleteProject, { params: { projectid }, headers })
                      .then(response => {
                        if (response.data.status == 200) {
                          toast.success(`${response.data.message}`, { autoClose: true });
                        } else {
                          toast.error(`${response.data.message}`, { autoClose: true });
                        }
                        passToSuccessLogs(response.data, currentFileName);
                        HandleRendering(1);
                        HandleNullProject(null); 
                        HandleDATA(null); 
                        setSubmitProfile(false);
                      })      
                      .catch(error => {
                        setSubmitProfile(false);
                        toast.error("Cant delete Election!", { autoClose: true });
                        passToErrorLogs(error, currentFileName);
                      });
                  } 
              }
            })
      };

      return (  
      <>
            {submitProfile && <FixedLoading />}   
            <SoftBox mt={5} mb={3} px={3}>      
                  <SoftBox mb={5} p={4} className="shadow-sm rounded-4 bg-white">
                        <SoftTypography variant="h6" fontWeight="medium" textTransform="capitalize" className="text-info text-gradient text-uppercase">
                              Direction!
                        </SoftTypography>
                        <SoftTypography fontWeight="bold" className="text-xs">
                              Please fill in the necessary fields. 
                        </SoftTypography> 
                        <SoftBox mt={2}>
                              <SoftBox component="form" role="form" className="px-md-0 px-2" onSubmit={handleSubmit}>
                                    <SoftTypography fontWeight="medium" textTransform="capitalize" color="warning" textGradient>
                                          Election Information
                                    </SoftTypography>
                                    <input type="hidden" name="projectid" value={formData.projectid} size="small" /> 
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1">Product ID:</SoftTypography>
                                                <SoftInput disabled value={PROJECT.projectid} size="small" /> 
                                          </Grid>     
                                          <Grid item xs={12} md={7} px={1}>
                                                <SoftTypography variant="button" className="me-1">Name:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput name="title" value={formData.title} onChange={handleChange} size="small" /> 
                                          </Grid>
                                          <Grid item xs={12} md={12} px={1}>
                                                <SoftTypography variant="button" className="me-1">Description:</SoftTypography>
                                                <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows="4"></textarea>
                                          </Grid>
                                    </Grid>
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} md={6} lg={3} px={1}>
                                                <SoftTypography variant="button" className="me-1">Total Polls:</SoftTypography>
                                                <SoftInput name="budget" value={formData.budget} onChange={handleChange} size="small" type="number" disabled/> 
                                          </Grid>
                                          <Grid item xs={12} md={6} lg={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Price: </SoftTypography>
                                                <input className="form-control form-control-sm text-secondary rounded-5" name="price" value={formData.price} onChange={handleChange} type="number" />
                                          </Grid>
                                    </Grid>
                                    <Grid mt={3} container spacing={0} alignItems="center">
                                          <Grid item xs={12} pl={1}>
                                                <Checkbox name="agreement" checked={formData.agreement} onChange={handleChange} />
                                                <SoftTypography variant="button" className="me-1 ms-2">Verify Data </SoftTypography>
                                                <SoftTypography variant="p" className="text-xxs text-secondary fst-italic">(Confirming that the information above are accurate) </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                          </Grid>
                                    </Grid>
                                    <Grid mt={3} container spacing={0} alignItems="center" justifyContent="end">
                                          <Grid item xs={12} sm={4} md={2} pl={1}>
                                                <SoftBox mt={2} display="flex" justifyContent="start">
                                                      <SoftButton onClick={handleDelete} className="mx-2 bg-danger text-white w-100" size="small">
                                                            delete
                                                      </SoftButton>
                                                </SoftBox>
                                          </Grid>
                                          <Grid item xs={12} sm={4} md={2} pl={1}>
                                                <SoftBox mt={2} display="flex" justifyContent="end">
                                                      <SoftButton onClick={handleCancel} className="mx-2 w-100" size="small" color="light">
                                                            Back
                                                      </SoftButton>
                                                </SoftBox>
                                          </Grid>
                                          <Grid item xs={12} sm={4} md={2} pl={1}>
                                                <SoftBox mt={2} display="flex" justifyContent="end">
                                                      <SoftButton type="submit" className="mx-2 w-100" size="small" color="dark">
                                                            Save
                                                      </SoftButton>
                                                </SoftBox>
                                          </Grid>
                                    </Grid>     
                              </SoftBox>
                        </SoftBox>
                  </SoftBox>
            </SoftBox>
      </>
      );
}

export default Edit;
