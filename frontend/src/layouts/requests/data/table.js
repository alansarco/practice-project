// @mui material components
import { Table as MuiTable } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
// React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import CheckIcon from '@mui/icons-material/Check';

// React base styles
import colors from "assets/theme/base/colors";
import typography from "assets/theme/base/typography";
import borders from "assets/theme/base/borders";
import SoftButton from "components/SoftButton";
import RemoveCircleTwoToneIcon from '@mui/icons-material/RemoveCircleTwoTone';
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";
import { passToSuccessLogs, passToErrorLogs } from "components/Api/Gateway";
import FixedLoading from "components/General/FixedLoading"; 
import { useStateContext } from "context/ContextProvider";

function Table({ requests, tablehead, HandleDATA, HandleRendering }) {
  const currentFileName = "layouts/requests/data/table.js";
  const { light, secondary } = colors;
  const { size, fontWeightBold } = typography;
  const { borderWidth } = borders;
  const [deletedata, setDeleteData] = useState(false);

  const {token} = useStateContext();  
  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
    'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
  };


  const handleSubmit = (row) => {
    HandleDATA(row.id);
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

  const renderRows = requests.map((row) => {
    if(row.statusno != 4) {
      return (
        <TableRow key={row.id}>
            <SoftBox
              className="pe-2 text-decoration-underline cursor-pointer fw-bold"
              component="td"
              fontSize={size.xs}
              onClick={() => handleSubmit(row)}
              color="dark"
              borderBottom={`${borderWidth[1]} solid ${light.main}`}
              borderTop={`${borderWidth[1]} solid ${light.main}`}
              sx={{
                "&:hover ": {
                  letterSpacing: "2px"        
                },
              }}  
            >
              {row.username}
            </SoftBox>
            <SoftBox
              className="px-2"
              component="td"
              fontSize={size.xs}
              color="secondary"
              borderBottom={`${borderWidth[1]} solid ${light.main}`}
              borderTop={`${borderWidth[1]} solid ${light.main}`}
            >
              {row.fullname}
            </SoftBox>  
            <SoftBox
              className="px-2"
              component="td"
              fontSize={size.xs}
              color="secondary"
              borderBottom={`${borderWidth[1]} solid ${light.main}`}
              borderTop={`${borderWidth[1]} solid ${light.main}`}
            >
              {row.doctype}
            </SoftBox>       
            <SoftBox
              className="px-2"
              component="td"
              fontSize={size.xs}
              color="secondary" 
              borderBottom={`${borderWidth[1]} solid ${light.main}`}
              borderTop={`${borderWidth[1]} solid ${light.main}`}
            >
              {row.status}    
            </SoftBox>  
            <SoftBox
              className="px-2"
              component="td"
              fontSize={size.xs}
              color="secondary" 
              borderBottom={`${borderWidth[1]} solid ${light.main}`}
              borderTop={`${borderWidth[1]} solid ${light.main}`}
            >
              {row.quantity}    
            </SoftBox>  
            <SoftBox
              className="px-2"
              component="td"
              fontSize={size.xs}
              color="secondary" 
              borderBottom={`${borderWidth[1]} solid ${light.main}`}
              borderTop={`${borderWidth[1]} solid ${light.main}`}
            >
              {row.sales}    
            </SoftBox>  
            <SoftBox
              className="px-2"
              component="td"
              fontSize={size.xs}
              color="secondary" 
              borderBottom={`${borderWidth[1]} solid ${light.main}`}
              borderTop={`${borderWidth[1]} solid ${light.main}`}
            >
              {row.date_needed}    
            </SoftBox>  
          </TableRow>
      )
    }});

  return (  
    <> 
      {deletedata && <FixedLoading /> }
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
    </>
  );
}

export default Table;
