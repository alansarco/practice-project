// React components
import { Checkbox, Grid, Icon, Select, Switch } from "@mui/material";
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
import { pdf  } from '@react-pdf/renderer';
import Indigency from "../Documents/Indigency";
import Residency from "../Documents/Residency";
    

function Edit({HandleRendering, REQUESTOR, HandleDATA, HandleNullRequestor, CAPTAIN}) {
      const currentFileName = "layouts/requests/components/Edit/index.js";
      const [submitProfile, setSubmitProfile] = useState(false);
      const [officials, setofficials] = useState();
      const {token} = useStateContext();  

      const YOUR_ACCESS_TOKEN = token; 
      const headers = {
            'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
      };
      
      const initialState = {
            id: REQUESTOR.id,
            status: REQUESTOR.status == null ? 0 : REQUESTOR.status,
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
            HandleDATA(null);
            HandleNullRequestor(null);
      };

      const IndigencyDoc = () => (
            <Indigency REQUESTOR={REQUESTOR} CAPTAIN={CAPTAIN} OFFICIALS={officials} />
      );
      const ResidencyDoc = () => (
            <Residency REQUESTOR={REQUESTOR} CAPTAIN={CAPTAIN} OFFICIALS={officials} />
      );
      const ClearanceDoc = () => (
            toast.error("Sorry, this document is not available right now!", { autoClose: true })
      );

      const handlePrint = async () => {
            if (REQUESTOR.doctype == "indigency") {
                  const blob = await pdf(<IndigencyDoc />).toBlob();
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
            } 
            else if (REQUESTOR.doctype == "residency") {
                  const blob = await pdf(<ResidencyDoc />).toBlob();
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
            } 
            else {
                  toast.error("Sorry, this document is not available right now!", { autoClose: true });
            }
      };
            
      const handleSubmit = async (e) => {
            e.preventDefault(); 
            toast.dismiss();
            // Check if all required fields are empty
            const requiredFields = [
                  "status"
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
                                    const response = await axios.post(apiRoutes.editRequest, formData, {headers});
                                    if(response.data.status == 200) {
                                          toast.success(`${response.data.message}`, { autoClose: true });
                                          HandleRendering(1);
                                          HandleDATA(null);
                                          HandleNullRequestor(null);
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

      return (  
      <>
            {submitProfile && <FixedLoading />}   
            <SoftBox mt={5} mb={3} px={3}>      
                  <SoftBox mb={5} p={4} className="shadow-sm rounded-4 bg-white">
                        <SoftTypography fontWeight="medium" color="warning" textGradient>
                              Direction!
                        </SoftTypography>
                        <SoftTypography fontWeight="bold" className="text-xs">
                              Please fill in the required fields. To remove request set status to "CANCELLED".
                        </SoftTypography> 
                        <SoftBox mt={2}>
                              <SoftBox component="form" role="form" className="px-md-0 px-2" onSubmit={handleSubmit}>
                                    <SoftTypography fontWeight="medium" textTransform="capitalize" color="warning" textGradient>
                                          Requestor's Information
                                    </SoftTypography>
                                    <input type="hidden" name="id" value={formData.id} size="small" /> 
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1">Buyer:</SoftTypography>
                                                <SoftInput disabled value={REQUESTOR.fullname} size="small" /> 
                                          </Grid>
                                          <Grid item xs={12} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1">Product Name:</SoftTypography>
                                                <SoftInput disabled value={REQUESTOR.doctype} size="small" /> 
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
                                          {/* <Grid item xs={12} sm={4} md={2} pl={1}>
                                                <SoftBox mt={2} display="flex" justifyContent="end">
                                                      <SoftButton onClick={handlePrint} className="mx-2 w-100" size="small" color="success">
                                                            Print
                                                      </SoftButton>
                                                </SoftBox>
                                          </Grid> */}
                                          <Grid item xs={12} sm={4} md={2} pl={1}>
                                                <SoftBox mt={2} display="flex" justifyContent="end">
                                                      <SoftButton onClick={handleCancel} className="mx-2 w-100" size="small" color="light">
                                                            Back
                                                      </SoftButton>
                                                </SoftBox>
                                          </Grid>
                                          {REQUESTOR.status != 4 &&
                                                <Grid item xs={12} sm={4} md={2} pl={1}>
                                                      <SoftBox mt={2} display="flex" justifyContent="end">
                                                            <SoftButton variant="gradient" type="submit" className="mx-2 w-100" size="small" color="warning">
                                                                  Save
                                                            </SoftButton>
                                                      </SoftBox>
                                                </Grid>     
                                          }
                                          
                                    </Grid>     
                              </SoftBox>
                        </SoftBox>  
                  </SoftBox>
            </SoftBox>
      </>
      );
}

export default Edit;
