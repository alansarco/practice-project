// React components
import { Grid} from "@mui/material";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";

import { useStateContext } from "context/ContextProvider";

function List({APPLICATION, POLL, HandleRendering, UpdateLoading}) {
      const {access} = useStateContext();

      const handleCancel = () => {
            HandleRendering(1);
      };
          
      return (  
      <>
            <SoftBox mt={5} mb={3} px={2}>      
                  <SoftBox mb={5} p={4} className="shadow-sm rounded-4 bg-white">
                        <SoftTypography fontWeight="medium" color="success" textGradient>
                              Candidate List!
                        </SoftTypography>
                        <SoftBox mt={2}>
                              <SoftBox className="px-md-0 px-2" >
                                    {APPLICATION && APPLICATION.length > 0 && 
                                    APPLICATION.map((position) => (
                                          <Grid container className="border-bottom border-2" spacing={0} alignItems="center" key={position.positionid}>
                                                <Grid item xs={12} md={4} px={1}>
                                                <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                      {position.position_name || " "}
                                                </SoftTypography>
                                                </Grid>
                                                <Grid item xs={12} md={8} px={1}>
                                                {position.candidates && (
                                                // Parse the candidates string into an array of objects
                                                (() => {
                                                      let candidatesArray = [];
                                                      try {
                                                            if (typeof position.candidates === 'string') {
                                                                  candidatesArray = JSON.parse(position.candidates);
                                                            } else if (Array.isArray(position.candidates)) {
                                                                  candidatesArray = position.candidates;
                                                            }
                                                            candidatesArray = candidatesArray.filter(candidate => candidate.status === 1);
                                                      } catch (error) {
                                                      console.error('Error parsing candidates:', error);
                                                      }

                                                      // Check if there are any approved candidates
                                                      if (candidatesArray.length === 0) {
                                                      return (
                                                      <SoftBox my={2} className="p-3">
                                                            <SoftTypography className="me-1 text-sm fw-normal fst-italic text-dark">
                                                            No Candidates
                                                            </SoftTypography>
                                                      </SoftBox>
                                                      );
                                                      }

                                                      return candidatesArray.map((candidate) => (
                                                      candidate.candidateid ? 
                                                      <SoftBox my={2} className="shadow p-3" key={candidate.candidateid}>
                                                            {access != 5 &&
                                                                  <SoftTypography color="info" className="me-1 text-sm fw-normal">
                                                                  {candidate.candidateid || " "}
                                                                  </SoftTypography>
                                                            }
                                                            <SoftTypography color="dark" className="me-1 text-sm fw-bold">
                                                            {candidate.candidate_name || " "}
                                                            </SoftTypography>
                                                            <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                            Grade {candidate.grade}
                                                            </SoftTypography>
                                                            <SoftTypography color="secondary" className="me-1 text-sm fw-normal">
                                                            {candidate.party || " "}
                                                            </SoftTypography>
                                                            <SoftTypography color="dark" className="me-1 text-sm fw-bold">
                                                            Platform:
                                                            <SoftTypography color="secondary" className="me-1 text-sm fw-normal fst-italic">
                                                            {candidate.platform || " "}
                                                            </SoftTypography>
                                                            </SoftTypography>
                                                      </SoftBox>
                                                      : 
                                                      <SoftBox my={2} className="p-3">
                                                            <SoftTypography className="me-1 text-sm fw-normal fst-italic text-dark">
                                                            No Candidates
                                                            </SoftTypography>
                                                      </SoftBox>
                                                      ));
                                                })()
                                                )}
                                                </Grid>
                                          </Grid>  
                                    ))}
                                    
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

export default List;
