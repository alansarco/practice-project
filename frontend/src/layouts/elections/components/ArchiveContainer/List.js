import { Checkbox, Grid, Card} from "@mui/material";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import { toast } from "react-toastify";
import { messages } from "components/General/Messages";

import axios from "axios";  
import { useStateContext } from "context/ContextProvider";
import { useState } from "react";
import FixedLoading from "components/General/FixedLoading"; 
import { passToErrorLogs, passToSuccessLogs  } from "components/Api/Gateway";
import { apiRoutes } from "components/Api/ApiRoutes";

import VerticalBarChart from "essentials/Charts/BarCharts/VerticalBarChart";
import CachedTwoToneIcon from '@mui/icons-material/CachedTwoTone';
import Table from "layouts/elections/components/ResultContainer/resulttable";
import { tablehead } from "layouts/elections/components/ResultContainer/resulthead";
import DefaultDoughnutChart from "essentials/Charts/DoughnutCharts/DefaultDoughnutChart";
import { distributionSelect } from "components/General/Utils";

function List({ RESULT, CANDIDATES, POLL, HandleRendering, UpdateLoading, reload, VOTE, MAXVOTERS, CURRENTVOTES, PARTICIPANTS }) {
      const [isLoading, setLoading] = useState(false);
      const currentFileName = "layouts/elections/components/ResultContainer/List.js";
      const [tabtitle, setTabtitle] = useState(1);
      const { token, access } = useStateContext();
      const YOUR_ACCESS_TOKEN = token;
      const headers = {
      'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
      };

      const handleCancel = () => {
            HandleRendering(1);
      };
      const handleRefresh = () => {
            UpdateLoading(true);
      };

      const handleResultTab = () => {
            setTabtitle(1);
      };
      const handleParticipantTab = () => {
            setTabtitle(2);
      };

      // Initialize state for the form
      const initialState = {
      positionSelections: {},  // Object to store selected candidate per position
      pollid: POLL.pollid,
      agreement: false,        // Agreement checkbox
      distribute: 1,
      };

      const [formData, setFormData] = useState(initialState);

      const handleFilter = (e) => {
            const { name, value, type } = e.target;
            if (type === "checkbox") {
                  setFormData({ ...formData, [name]: !formData[name]});
            } else {
                  setFormData({ ...formData, [name]: value });
            }
      };

      
  return (
    <>
      {reload && <FixedLoading />}
      {isLoading && <FixedLoading />}
      <SoftBox mt={5} mb={3} px={2}>      
            <SoftBox mb={5}>    
                  <Grid container spacing={0} alignItems="center" justifyContent="end">
                        <Grid item xs={12} md={5} pl={1}>
                              <SoftBox display="flex" justifyContent="end">
                                    <SoftButton onClick={handleRefresh} className="mt-2 mt-sm-0 mx-1 text-xxs px-3 rounded-pill" size="medium" color="success" iconOnly>
                                          <CachedTwoToneIcon /> 
                                    </SoftButton>
                                    <SoftButton onClick={handleResultTab} className="mt-2 mt-sm-0 mx-1 w-100 text-xxs px-5 rounded-pill text-nowrap" size="small" color={tabtitle == 1 ? "dark" : "white"}>
                                          Results
                                    </SoftButton>
                                    {access == 999 && 
                                    <SoftButton onClick={handleParticipantTab} className="mt-2 mt-sm-0 mx-1 w-100 text-xxs px-5 rounded-pill text-nowrap" size="small" color={tabtitle == 2 ? "dark" : "white"}>
                                          Participants
                                    </SoftButton>
                                    }          
                              </SoftBox>
                        </Grid>   
                  </Grid>   
                  {tabtitle == 1 && 

                  <SoftBox mt={2}>
                        <SoftBox className="px-md-0 px-2" >
                              <Grid mt={3} container spacing={0} alignItems="center" justifyContent="center">
                                    <Grid item xs={12} sm={12} xl={12}>
                                    <VerticalBarChart
                                          title={POLL.pollname}
                                          nodata={RESULT.data && RESULT.data.every(value => value === "0")}
                                          height="20rem"
                                          maxCount={MAXVOTERS}
                                          currentCount={CURRENTVOTES}
                                          chart={{
                                          labels: RESULT.candidateid || [], 
                                          datasets: [{
                                                color: "dark",
                                                data: RESULT.votes || [] 
                                          }],
                                          }}
                                    />
                                    </Grid>    
                                    {access >= 10 &&
                                    <>
                                    <Grid item xs={12} sm={6} alignItems="center" className="d-block d-md-flex" justifyContent="center" mt={4}>
                                          <SoftTypography className="me-2 text-nowrap" variant="h6">Filter Distribution Result:</SoftTypography>
                                          <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer w-100" name="distribute" value={formData.distribute} onChange={handleFilter} >
                                                {distributionSelect && distributionSelect.map((distribute) => (
                                                <option key={distribute.value} value={distribute.value}>
                                                      {distribute.desc}
                                                </option>
                                                ))}
                                          </select>
                                    </Grid> 
                                    </>
                                    }
                                    {access >= 10 && formData.distribute == 1 &&
                                    <Grid item xs={12} sm={12} xl={12}>
                                          <SoftTypography mt={3} fontWeight="bold" color="info" textGradient fontSize="1.5rem">DISTRIBUTION OF VOTES BY GENDER</SoftTypography>
                                          <Grid container spacing={2} alignItems="center" justifyContent="start">
                                                {RESULT && RESULT.voters_info.map((event, index) => (
                                                <Grid item xs={12} md={6} lg={4}>
                                                      <DefaultDoughnutChart
                                                      key={index} 
                                                      title={RESULT.candidateid[index]} 
                                                      chart={{
                                                            labels: ["Male", "Female"],
                                                            datasets: {
                                                            label: "Elections",
                                                            backgroundColors: ["dark", "primary"],
                                                            data: Object.values(event), 
                                                            },
                                                      }}
                                                      />
                                                </Grid> 
                                                ))}
                                          </Grid>   
                                    </Grid> 
                                    } 
                                    {access >= 10 && formData.distribute == 2 &&
                                    <Grid item xs={12} sm={12} xl={12}>
                                          <SoftTypography mt={3} fontWeight="bold" color="info" textGradient fontSize="1.5rem">DISTRIBUTION OF VOTES BY GRADE LEVEL</SoftTypography>
                                          <Grid container spacing={2} alignItems="center" justifyContent="start">
                                                {RESULT && RESULT.voters_grade.map((event, index) => (
                                                <Grid item xs={12} md={6} lg={4}>
                                                      <DefaultDoughnutChart
                                                      key={index} 
                                                      title={RESULT.candidateid[index]} 
                                                      chart={{
                                                            labels: ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],  
                                                            datasets: {
                                                                  label: "Elections",
                                                                  backgroundColors: ["dark", "success", "primary", "warning", "info", "error"],
                                                                  data: Object.values(event), 
                                                            },
                                                      }}
                                                      />
                                                </Grid> 
                                                ))}
                                          </Grid>   
                                    </Grid>   
                                    }                    
                              </Grid>     
                              
                        </SoftBox>
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
                  }
                  {tabtitle == 2 && 
                  <SoftBox mt={3}>
                        <SoftBox className="px-md-0 px-2" > 
                              <Card className="bg-white px-4 pt-5">
                                    <SoftBox display="flex" justifyContent="end">
                                          <SoftTypography color="info" className="text-center ms-3" variant="h6">
                                                Casted Votes:
                                                <b className="text-dark">{MAXVOTERS || 0}</b>
                                          </SoftTypography>
                                    </SoftBox>
                                    <Table table="sm" PARTICIPANTS={PARTICIPANTS} tablehead={tablehead} />
                              </Card>
                        </SoftBox>
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
                  }          
            </SoftBox>
      </SoftBox>
    </>
  );
}

export default List;
