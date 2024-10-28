// React components
import { Checkbox, Grid } from "@mui/material";
import FixedLoading from "components/General/FixedLoading";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftInput from "components/SoftInput";
import SoftTypography from "components/SoftTypography";
import { useState } from "react";
import { toast } from "react-toastify";
import { messages } from "components/General/Messages";
import { useStateContext } from "context/ContextProvider";
import { passToErrorLogs, passToSuccessLogs  } from "components/Api/Gateway";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";
import { projectStatus } from "components/General/Utils";

function FormImage({HandleRendering}) {
      const currentFileName = "layouts/elections/components/Add/index.js";
      const [submitProfile, setSubmitProfile] = useState(false);
      const {token} = useStateContext();  
      const [futureImg, setFutureImg] = useState([]);
      const [previewImg, setPreviewImg] = useState();

      const YOUR_ACCESS_TOKEN = token; 
      const headers = {
            'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
      };

      const initialState = {
            title: "Banana Split",
            description: "",
            price: "89",
            status: 1,
            agreement: true,   
      };

      const handleFutureImg = (e) => {
            setFutureImg({ picture: e.target.files[0] });
            setPreviewImg(e.target.files[0]);
      }
        
      const [formData, setFormData] = useState(initialState);     

      const handleChange = (e) => { 
            const { name, value, type } = e.target;
            if (type === "checkbox") {     
                  setFormData({ ...formData, [name]: !formData[name]});
            } 
            else {
                  setFormData({ ...formData, [name]: value });
            }
      };

      const handleCancel = () => {
            HandleRendering(1);
      };
            
      const handleSubmit = async (e) => {
            e.preventDefault(); 
            toast.dismiss();

            const productData = new FormData();
            productData.append('title', formData.title);
            productData.append('description', formData.description);
            productData.append('price', formData.price);
            productData.append('status', formData.status);
            productData.append('picture', futureImg.picture);
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
                                    const response = await axios.post(apiRoutes.addElection, productData, {headers});
                                    if(response.data.status == 200) {
                                          setFormData(initialState);
                                          toast.success(`${response.data.message}`, { autoClose: true });
                                          HandleRendering(1);
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
            <SoftBox mt={5} mb={3} px={2}>      
                  <SoftBox mb={5} p={4} className="shadow-sm rounded-4 bg-white">
                        <SoftTypography fontWeight="medium" color="warning" textGradient>
                              Direction!
                        </SoftTypography>
                        <SoftTypography fontWeight="bold" className="text-xs">
                              Please fill in the necessary fields.
                        </SoftTypography>     
                        <SoftBox p={2} className="border image-height-preview">
                              {previewImg && (
                                    <img style={{ width: "100%", height:"100%" }} className='rounded border' src={URL.createObjectURL(previewImg)} alt="product.png" />
                              )}
                              <SoftTypography className="text-xxs fst-italic">
                                    Product Preview
                              </SoftTypography> 
                        </SoftBox>     
                        <SoftBox mt={2}>
                              <SoftBox component="form" role="form" className="px-md-0 px-2" onSubmit={handleSubmit}>
                                    <SoftTypography fontWeight="medium" textTransform="capitalize" color="warning" textGradient>
                                          Product Information
                                    </SoftTypography>
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} md={7} px={1}>
                                                <SoftTypography variant="button" className="me-1">Name:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput name="title" value={formData.title} onChange={handleChange} size="small" /> 
                                          </Grid>
                                          <Grid item xs={12} md={12} px={1}>
                                                <SoftTypography variant="button" className="me-1">Description:</SoftTypography>
                                                <textarea name="description" value={formData.description} onChange={handleChange} className="form-control text-xs" rows="4"></textarea>
                                          </Grid>
                                    </Grid>
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} md={6} lg={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Status:</SoftTypography>
                                                <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer" name="status" value={formData.status} onChange={handleChange}>
                                                      {projectStatus && projectStatus.map((status) => (
                                                      <option key={status.value} value={status.value}>
                                                            {status.desc}
                                                      </option>
                                                      ))}
                                                </select> 
                                          </Grid>   
                                          <Grid item xs={12} md={6} lg={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Price: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <input className="form-control form-control-sm text-secondary rounded-5" name="price" value={formData.price} onChange={handleChange} type="number" />
                                          </Grid>     
                                          <Grid item xs={12} md={6} lg={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Picture: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <input className="form-control form-control-sm text-secondary rounded-5" name="picture" onChange={handleFutureImg} type="file" />
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
                                                <SoftBox mt={2} display="flex" justifyContent="end">
                                                      <SoftButton onClick={handleCancel} className="mx-2 w-100" size="small" color="light">
                                                            Back
                                                      </SoftButton>
                                                </SoftBox>
                                          </Grid>
                                          <Grid item xs={12} sm={4} md={2} pl={1}>
                                                <SoftBox mt={2} display="flex" justifyContent="end">
                                                      <SoftButton variant= "gradient" type="submit" className="mx-2 w-100" size="small" color="warning">
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

export default FormImage;
