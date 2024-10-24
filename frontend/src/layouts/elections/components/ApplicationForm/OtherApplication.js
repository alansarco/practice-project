// React components
import { Grid} from "@mui/material";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";

function OtherApplication({APPLICATION, POLL, HandleRendering, UpdateLoading}) {
      const handleCancel = () => {
            HandleRendering(1);
      };

      return (  
      <>
            <SoftBox mt={5} mb={3} px={3}>      
                  <SoftBox mb={5} p={4} className="shadow-sm rounded-4 bg-white">
                        <SoftTypography fontWeight="medium" color="success" textGradient>
                              Good Day!
                        </SoftTypography>
                        <SoftTypography fontWeight="bold" className="text-xs">
                              It seems that you have active application from other elections. You cannot apply for another one.     
                        </SoftTypography> 
                        <SoftBox mt={2}>
                              <SoftBox className="px-md-0 px-2" >
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
                  </SoftBox>
            </SoftBox>
      </>
      );
}

export default OtherApplication;
