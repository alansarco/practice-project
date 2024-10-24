import { useState, useEffect } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Document from "essentials/Icons/Document";

// React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftAvatar from "components/SoftAvatar";

// React icons
import Cube from "essentials/Icons/Cube";

// React base styles
import breakpoints from "assets/theme/base/breakpoints";

// Images
import logo from "assets/images/logo.png";
import bgImage from "assets/images/snhs.png";
import { apiRoutes } from "components/Api/ApiRoutes";
import axios from "axios";
import { passToSuccessLogs } from "components/Api/Gateway";
import { passToErrorLogs } from "components/Api/Gateway";
import { useStateContext } from "context/ContextProvider";
import { toast } from "react-toastify";
import FixedLoading from "components/General/FixedLoading";
import Information from "layouts/elections/components/Information";
import List from "layouts/elections/components/CandidateList/List";

function CandidateList({authUser, FROM, INFO, HandleRendering}) {
  const currentFileName = "layouts/elections/components/CandidateList/index.js";
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);

  const info = INFO;

  const [menu, setMenu] = useState("details");

  const setProfile = () => {
    setMenu("details");
    setTabValue(0);
  };
  const setApply = () => {
    setMenu("apply");
    setTabValue(1);
  };

  useEffect(() => {
    // A function that sets the orientation state of the tabs.
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.xsm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    /** 
     The event listener that's calling the handleTabsOrientation function when resizing the window.
    */
    window.addEventListener("resize", handleTabsOrientation);

    // Call the handleTabsOrientation function to set the state with the initial value.
    handleTabsOrientation();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, [tabsOrientation]);

  const handleSetTabValue = (event, newValue) => setTabValue(newValue);

  const {token, role, access} = useStateContext();
  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
    'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
  };

  const [Poll, setPoll] = useState([]);
  const [Position, setPosition] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reload, setReload] = useState(true);
  const [fetchapplication, setFetchApplication] = useState([]);

  const UpdateLoading = (reloading) => {
    setReload(reloading);
  };

  useEffect(() => {
    if (reload) {
      setReload(true);
      axios.get(apiRoutes.viewApplications, { params: { info }, headers })
        .then(response => {
          setFetchApplication(response.data.applications);
          passToSuccessLogs(response.data, currentFileName);
          setReload(false);
          setIsLoading(false);
        })  
        .catch(error => {
          passToErrorLogs(`Checking Existing Application Error!  ${error}`, currentFileName);
          setReload(false);
          setIsLoading(false);
        });
    }
  }, [reload]);

  useEffect(() => {
    if (reload) {
      setReload(true);
      axios.get(apiRoutes.electionInfo, { params: { info }, headers })
        .then(response => {
          if (response.data.status === 200) {
            setPoll(response.data.election);  
            setPosition(response.data.positions);  
          } else {
            toast.error(`${response.data.message}`, { autoClose: true });
          }
          passToSuccessLogs(response.data, currentFileName);
          setReload(false);
          setIsLoading(false);
        })  
        .catch(error => {
          passToErrorLogs(`Election Data not Fetched!  ${error}`, currentFileName);
          setReload(false);
          setIsLoading(false);
        });
    }
  }, [reload]);

  
  return (
    <>
    {isLoading && <FixedLoading /> }
    <SoftBox position="relative" mt={3}>
      <SoftBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.3),
              rgba(gradients.info.state, 0.1)
            )}, url(${bgImage})`, 
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      />
      <Card
        sx={{
          backdropFilter: `saturate(200%) blur(30px)`,
          backgroundColor: ({ functions: { rgba }, palette: { white } }) => rgba(white.main, 0.8),
          boxShadow: ({ boxShadows: { navbarBoxShadow } }) => navbarBoxShadow,
          position: "relative",
          mt: -8,
          mx: 3,
          py: 2,
          px: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <SoftAvatar
              src={logo}
              alt="profile-image"
              variant="rounded"
              size="xl"
              shadow="sm"
            />
          </Grid>
          <Grid item>
            <SoftBox height="100%" mt={0.5} lineHeight={1}>
              <SoftTypography variant="h5" fontWeight="medium">
                {Poll.pollname}{" "}
              </SoftTypography>
              <SoftTypography variant="button" color="text" fontWeight="medium">
                {Poll.pollid}{" "}
              </SoftTypography>
            </SoftBox>
          </Grid>
          <Grid item xs={12} md={5} sx={{ ml: "auto" }}>
            <AppBar position="static">
              <Tabs
                orientation={tabsOrientation}
                value={tabValue}
                onChange={handleSetTabValue}
                sx={{ background: "transparent" }}
              >
                <Tab label="Information" onClick={setProfile} icon={<Cube />} />
                <Tab label="Candidate List" onClick={setApply} icon={<Document />} />
              </Tabs> 
            </AppBar>
          </Grid>
        </Grid>
      </Card>
    </SoftBox>
    {menu === "details" && <Information UpdateLoading={UpdateLoading} FROM={FROM} POSITIONS={Position} POLL={Poll} HandleRendering={HandleRendering}  />}
    
    {menu === "apply" &&
      <List APPLICATION={fetchapplication} UpdateLoading={UpdateLoading} POLL={Poll} HandleRendering={HandleRendering} />
    }
    </>
  );
}

export default CandidateList;
