// @mui material components
import Card from "@mui/material/Card";

// React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import SoftButton from "components/SoftButton";
import { ToastContainer, toast } from 'react-toastify';
import { Link } from 'react-router-dom';

import Icon from "@mui/material/Icon";
import FilterListIcon from '@mui/icons-material/FilterList';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import logo from "assets/images/logo.jpg";
  
// React examples
import DashboardNavbar from "essentials/Navbars"; 
import Footer from "essentials/Footer";

// Data
  import { Grid } from "@mui/material";

import React, { useEffect, useState } from "react";
import FixedLoading from "components/General/FixedLoading";
import { useStateContext } from "context/ContextProvider";
import { Navigate } from "react-router-dom";

import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";
import { passToErrorLogs } from "components/Api/Gateway";
import { passToSuccessLogs } from "components/Api/Gateway";
import { useApplicationsData } from "./data/applicationRedux";
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';
import ShoppingCartTwoToneIcon from '@mui/icons-material/ShoppingCartTwoTone';

function Application() {
  const currentFileName = "layouts/application/data/index.js";
  const {token, access, role, updateTokenExpiration} = useStateContext();
  updateTokenExpiration();
  if (!token) {
    return <Navigate to="/authentication/sign-in" />
  }
  const [reload, setReload] = useState(false);

  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
    'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
  };

  const [data, setDATA] = useState(); 
  const [imageUrl, setImageUrl] = useState('');
  const [cart, setCart] = useState(false); 
  const [home, setHome] = useState(true); 
  const [bghome, setBgHome] = useState("warning"); 
  const [bgcart, setBgCart] = useState("secondary"); 
  const [rendering, setRendering] = useState(1);
  const {applications, isLoading} = useApplicationsData({ applications: rendering }, []);

  const handleHome = (e) => {
    setHome(true);
    setCart(false);
    setBgHome("warning");
    setBgCart("secondary");
  };

  const handleCart = (e) => {
    setHome(false);
    setCart(true);
    setBgHome("secondary");
    setBgCart("warning");
  };

  const handleOrderNow = async (row) => {
    const projectid = row.projectid;  
    Swal.fire({ 
      customClass: {
        title: 'alert-title',
        icon: 'alert-icon',
        confirmButton: 'alert-confirmButton',
        cancelButton: 'alert-cancelButton',
        container: 'alert-container',
        input: 'alert-input',
        popup: 'alert-popup'
      },
      title: 'Confirm Order',
      input: "number",
      text: "Set total quantity to be purchased!",
      icon: 'warning',        
      showCancelButton: true,
      confirmButtonColor: '#3085d6',  
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm Order'
    }).then((result) => {
      if (result.isConfirmed) {
        const purchase_qty = result.value;
        setReload(true);
        setRendering(0);
          if (!token) {
            toast.error(messages.prohibit, { autoClose: true });
          }
          else if (purchase_qty < 1) {
            setReload(false);
            toast.error("Invalid quantity!", { autoClose: true });
          }
          else {  
            axios.get(apiRoutes.orderNow, { params: { projectid, purchase_qty }, headers })
              .then(response => {
                if (response.data.status == 200) {
                  toast.success(`${response.data.message}`, { autoClose: true });
                } else {
                  toast.error(`${response.data.message}`, { autoClose: true });
                }
                passToSuccessLogs(response.data, currentFileName);
                setRendering(1);
                setReload(false);
              })  
              .catch(error => {
                setReload(false);
                toast.error("Error ordering!", { autoClose: true });
                passToErrorLogs(error, currentFileName);
              });
          } 
      }
    });
  };

  const handleCancelOrder = async (row) => {
    const id = row.id;  
    Swal.fire({
      customClass: {
        title: 'alert-title',
        icon: 'alert-icon',
        confirmButton: 'alert-confirmButton',
        cancelButton: 'alert-cancelButton',
        container: 'alert-container',
        popup: 'alert-popup'
      },
      title: 'Cancel Order?',
      text: "This action cannot be reverted once confirm!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',  
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setReload(true);
        setRendering(0);
          if (!token) {
            toast.error(messages.prohibit, { autoClose: true });
          }
          else {  
            axios.get(apiRoutes.cancelOrder, { params: { id }, headers })
              .then(response => {
                if (response.data.status == 200) {
                  toast.success(`${response.data.message}`, { autoClose: true });
                } else {
                  toast.error(`${response.data.message}`, { autoClose: true });
                }
                passToSuccessLogs(response.data, currentFileName);
                setRendering(1);
                setReload(false);
              })  
              .catch(error => {
                setReload(false);
                toast.error("Error cancelling order!", { autoClose: true });
                passToErrorLogs(error, currentFileName);
              });
          } 
      }
    })
  };

  return (
    <> 
      {isLoading && <FixedLoading />} 
      {reload && <FixedLoading />} 
        <DashboardNavbar RENDERNAV={rendering}/> 
        <SoftBox p={2}>
          <SoftBox >   
            <SoftBox display="flex" justifyContent="center">
              <SoftButton className="mx-2" color={bghome} variant="gradient" onClick={handleHome} > <HomeTwoToneIcon /> </SoftButton>
              <SoftButton className="mx-2" color={bgcart} variant="gradient" onClick={handleCart} > <ShoppingCartTwoToneIcon /> </SoftButton>
            </SoftBox>
            <Grid container spacing={1} alignItems="center" justifyContent="center" className="px-md-4 px-2 pt-3 pb-md-5 pb-4">
            {home &&
            <>
              <Grid item xs={12}>
                <SoftTypography color="dark" textGradient className="text-lg fw-bold">
                  {applications.products && applications.products.length > 0 ? "Come and try our Delicious Products!" : ""}
                </SoftTypography>
                <SoftBox className="rounded-3 p-3 text-whiter">
                  {applications.products && applications.products.length > 0 && (
                    <Grid container spacing={3} alignItems="center">
                      {applications.products.map((row) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} px={1} key={row.projectid}>
                          <SoftBox className="shadow rounded-3 p-3 text-xxs text-whiter">
                            <SoftTypography className="text-sm fw-bold" color="warning" textGradient>
                              {row.title}
                            </SoftTypography>
                            {row.picture instanceof Blob && (
                              <img src={URL.createObjectURL(row.picture)} alt={row.title} />
                            )}
                            <SoftBox className="d-flex">
                              <img src={logo} width={100} height={150} className="m-auto" />
                            </SoftBox>
                            <SoftTypography className="text-xxs text-whiter fw-bold">
                              Description: <span className="text-xxs text-whiter fw-normal">{row.description}</span>
                            </SoftTypography>
                            <SoftTypography className="text-xxs text-whiter text-nowrap fw-bold">
                              Price: <SoftTypography variant="span" textGradient color="warning" className="text-sm fw-bold text-nowrap">{row.price}.00</SoftTypography>
                            </SoftTypography> 
                            <SoftBox mt={2} display="flex" justifyContent="end">
                                <SoftButton onClick={() => handleOrderNow(row)} variant="gradient" className="w-100" size="small" color="warning">
                                  Buy Now
                                </SoftButton>
                            </SoftBox>                        
                          </SoftBox>
                        </Grid>
                      ))}
                    </Grid>
                  ) }
                </SoftBox>
              </Grid>
            </>
            }
            {cart &&
            <>
              <Grid item xs={12} sm={10} md={8} lg={4} px={1}>
                <SoftBox className="shadow rounded-3 p-3 text-whiter">
                  <SoftTypography textGradient color="warning" className="text-lg fw-bold text-nowrap">
                    My Recent Order
                  </SoftTypography>
                  <SoftTypography className="text-sm text-nowrap text-whiter mt-3">
                    Active Order
                  </SoftTypography>
                  {applications.activeorder && applications.activeorder.length > 0 && (
                  <Grid container spacing={0} alignItems="center">
                    {applications.activeorder.map((row) => (
                      <Grid item xs={12} key={row.id}>
                        <SoftBox className="border rounded-3 p-3 text-whiter mt-2">
                          <SoftTypography textGradient color="warning" className="text-sm text-nowrap fw-bold">
                            {row.title}
                          </SoftTypography>
                          <SoftTypography className="text-xxs text-whiter text-nowrap fw-bold">
                            Price: <span className="text-xxs text-whiter text-nowrap fw-normal">{row.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                          </SoftTypography>
                          <SoftTypography className="text-xxs text-whiter text-nowrap fw-bold">
                            Quantity: <span className="text-xxs text-whiter text-nowrap fw-normal">{row.quantity}</span>
                          </SoftTypography>
                          <SoftTypography className="text-xxs text-whiter text-nowrap fw-bold">
                            Total: <span className="text-xxs text-whiter text-nowrap fw-normal">{row.polls.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                          </SoftTypography>
                          <SoftTypography className="text-xxs text-whiter fw-bold">
                            Date Ordered: <span className="text-xxs text-whiter fw-normal">{row.myorder_date}</span>
                          </SoftTypography>
                          <SoftTypography className="text-xxs text-whiter text-nowrap fw-bold">
                            Receipt No: <span className="text-xxs text-whiter text-nowrap fw-normal">{row.receipt_no}</span>
                          </SoftTypography> 
                          <SoftTypography className="text-xxs text-whiter text-nowrap fw-bold">
                            Status: <span className="text-xs text-nowrap fw-normal">
                              {row.status == 1 ? "pending" : row.status == 2 ? "processing" : "delivery"} 
                              </span>
                          </SoftTypography> 
                          {row.status == 1 &&
                            <SoftBox mt={1} display="flex" justifyContent="end">
                              <SoftButton onClick={() => handleCancelOrder(row)} variant="gradient" className="" size="small" color="warning">
                                Cancel
                              </SoftButton>
                            </SoftBox>
                          }                          
                        </SoftBox>
                      </Grid>
                    ))}
                  </Grid>
                  )}
                  <SoftTypography className="text-sm text-nowrap text-whiter mt-3">
                    Order History
                  </SoftTypography> 
                  {applications.pastorder && applications.pastorder.length > 0 && (
                  <Grid container spacing={0} alignItems="center">
                    {applications.pastorder.map((row) => (
                      <Grid item xs={12} key={row.id}>
                        <SoftBox className="bg-history rounded-3 p-2 text-whiter">
                        <SoftTypography textGradient color="warning" className="text-sm text-nowrap fw-bold">
                            {row.title}
                          </SoftTypography>
                          <SoftTypography className="text-xxs text-whiter text-nowrap fw-bold">
                            Price: <span className="text-xxs text-whiter text-nowrap fw-normal">{row.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                          </SoftTypography>
                          <SoftTypography className="text-xxs text-whiter text-nowrap fw-bold">
                            Quantity: <span className="text-xxs text-whiter text-nowrap fw-normal">{row.quantity}</span>
                          </SoftTypography>
                          <SoftTypography className="text-xxs text-whiter fw-bold">
                            Date Ordered: <span className="text-xxs text-whiter fw-normal">{row.myorder_date}</span>
                          </SoftTypography>
                          <SoftTypography className="text-xxs text-whiter text-nowrap fw-bold">
                            Receipt No: <span className="text-xxs text-whiter text-nowrap fw-normal">{row.receipt_no}</span>
                          </SoftTypography> 
                        </SoftBox>
                      </Grid>
                    ))}
                  </Grid>
                  )}
                </SoftBox>
              </Grid>
            </>
            }
            </Grid>
          </SoftBox>
        </SoftBox>
        <Footer />
        <ToastContainer
          position="bottom-right"
          autoClose={false}
          limit={5}
          newestOnTop={false}
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          theme="light"
        />
    </>
  );
}

export default Application;