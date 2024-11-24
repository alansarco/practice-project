// @mui material components
import { Table as MuiTable } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
// React components
import SoftBox from "components/SoftBox";

// React base styles
import colors from "assets/theme/base/colors";
import typography from "assets/theme/base/typography";
import borders from "assets/theme/base/borders";
import SoftButton from "components/SoftButton";
import PeopleAltTwoToneIcon from '@mui/icons-material/PeopleAltTwoTone';
import { useStateContext } from "context/ContextProvider";

function Table({ authUser, elections, tablehead, HandleDATA, HandleRendering }) {
  const {access, role} = useStateContext();
  const { light, secondary } = colors;
  const { size, fontWeightBold } = typography;
  const { borderWidth } = borders;

  const handleViewApplication = (pollid) => {
    HandleDATA(pollid);
    HandleRendering(5);
  }

  const handleViewPoll = (pollid) => {
    HandleDATA(pollid);
    HandleRendering(2);
  }

  const renderColumns = tablehead.map((head , key) => {
    return (
      <SoftBox
        className={head.padding}
        component="th"
        key={key}
        pt={1.5}
        pb={1.25}
        textAlign={head.align}
        fontSize={size.xxs}
        fontWeight={fontWeightBold}
        color="secondary"
        >
        {head.name.toUpperCase()}
      </SoftBox>
    );
  });

  const filteredElections = elections.filter((row) => {
    if (access == 999) {
      return true;  // No filter for access level 999
    } else if (access == 10) {
      return authUser.username === row.admin_id && row.allowed === "yes";
    } else if (access == 5) {
      return row.allowed === "yes";
    }
    return false; // Default to false if access level doesn't match any case
  });

  const renderRows = filteredElections.map((row) => {
    return (
      <TableRow key={row.pollid}>
          <SoftBox
            className="pe-2 text-decoration-underline cursor-pointer fw-bold"
            component="td"
            fontSize={size.xs}
            onClick={() => handleViewPoll(row.pollid)}
            color="dark"
            borderBottom={`${borderWidth[1]} solid ${light.main}`}
            borderTop={`${borderWidth[1]} solid ${light.main}`}
            sx={{
              "&:hover ": {
                letterSpacing: "2px"        
              },
            }}  
          >
            {row.pollid}
          </SoftBox>   
          <SoftBox
            className="px-2"
            component="td"
            fontSize={size.xs}
            color="secondary"
            borderBottom={`${borderWidth[1]} solid ${light.main}`}
            borderTop={`${borderWidth[1]} solid ${light.main}`}
          >
            {row.pollname}
          </SoftBox>  
          <SoftBox
            className="px-2"
            component="td"
            fontSize={size.xs}
            color="secondary"
            borderBottom={`${borderWidth[1]} solid ${light.main}`}
            borderTop={`${borderWidth[1]} solid ${light.main}`}
          >
            {row.participant_grade === "11,12" ? "All SHS" : 
              row.participant_grade === "7,8,9,10" ? "All JHS" : 
              row.participant_grade === "7,8,9,10,11,12" ? "All Students" : 
              row.participant_grade}
          </SoftBox>
          <SoftBox
            className="px-2"
            component="td"
            fontSize={size.xs}
            color="secondary" 
            borderBottom={`${borderWidth[1]} solid ${light.main}`}
            borderTop={`${borderWidth[1]} solid ${light.main}`}
          >
            {row.voting_starts}
          </SoftBox>  
          <SoftBox
            className="px-2"
            component="td"
            fontSize={size.xs}
            color="secondary" 
            borderBottom={`${borderWidth[1]} solid ${light.main}`}
            borderTop={`${borderWidth[1]} solid ${light.main}`}
          >
            {row.voting_ends}    
          </SoftBox>  
          <SoftBox
            className="px-2"
            component="td"
            fontSize={size.xs}
            color="secondary" 
            borderBottom={`${borderWidth[1]} solid ${light.main}`}
            borderTop={`${borderWidth[1]} solid ${light.main}`}
          >
            {row.admin_name}    
          </SoftBox>  
          <SoftBox
            className="px-2"
            component="td"
            fontSize={size.xs}
            color="secondary" 
            textAlign="center"
            borderBottom={`${borderWidth[1]} solid ${light.main}`}
            borderTop={`${borderWidth[1]} solid ${light.main}`}
          >
            <SoftButton onClick={() => handleViewApplication(row.pollid)} className="text-xxxs px-3 rounded-pill" size="small" variant="gradient" color="info">
                <PeopleAltTwoToneIcon className="me-1 p-0"/> Candidates
            </SoftButton>
          </SoftBox>  
        </TableRow>
    )});

  return (  
      <TableContainer className="shadow-none bg-gray p-3">
        <MuiTable className="table table-sm table-hover table-responsive">  
          <SoftBox component="thead">
            <TableRow>{renderColumns}</TableRow>  
          </SoftBox>  
          <TableBody component="tbody">
            {renderRows}  
          </TableBody>
        </MuiTable> 
      </TableContainer>
  );
}

export default Table;
