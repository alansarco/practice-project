import { useState } from "react";

// @mui material components
import Checkbox from "@mui/material/Checkbox";

// React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import SoftButton from "components/SoftButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import logo from "assets/images/logo.png";

// react-router-dom components
import { Link, useNavigate, Navigate  } from "react-router-dom";
import { useStateContext } from "context/ContextProvider";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import FixedLoading from "components/General/FixedLoading";
import { useSignInData } from "./data/signinRedux";
import MainLoading from "components/General/MainLoading";
import { passToSuccessLogs, passToErrorLogs } from "components/Api/Gateway";
import { isEmpty } from "components/General/Utils"; 
import { messages } from "components/General/Messages";
import { apiRoutes } from "components/Api/ApiRoutes";

function SignIn() {
  const currentFileName = "layouts/authentication/sign-in/index.js";
  const {token,  setUser, setRole, setAccess, setToken} = useStateContext(); 
  const [submitLogin, setSubmitLogin] = useState(false);
  const [submitChangePass, setSubmitChangePass] = useState(false);
  const [newUser, setNewUser] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'USER',
  });

  const [passForm, setPassForm] = useState({
    username: 'Alan',
    newpassword: '',
    confirmpassword: '',
  });

  const navigate = useNavigate(); 

  if (token) {
    return <Navigate to="/dashboard" />
  }
  
  const { isLoading, status} = useSignInData();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassForm({ ...passForm, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    toast.dismiss();
    if(isEmpty(formData.username) || isEmpty(formData.password)) {
      toast.warning(messages.required, { autoClose: true });
    }
    else {
      setSubmitLogin(true);
      try {
        const response = await axios.post(apiRoutes.login, formData);
        let token = response.data.access_token;
        let changepass = response.data.changepass;
        passToSuccessLogs(response.data.message, currentFileName);
        if (token) {
          setToken(token);
          setUser(response.data.user);
          setRole(response.data.role);
          setAccess(response.data.access);
          navigate("/dashboard");
        }
        else if (changepass) {
          setNewUser(true);
          setPassForm(prevState => ({ ...prevState, 
            username: response.data.user,
            newpassword: "",
            confirmpassword: "",
          }));
          toast.success(`${response.data.message}`, { autoClose: true });
          passToSuccessLogs(response.data.message, currentFileName);
        }
        else {  
          toast.error(`${response.data.message}`, { autoClose: true });
        }
      } catch (error) {
          toast.error(`Login Failed! ${error}`, { autoClose: true });
          passToErrorLogs(error, currentFileName);
      }
      setSubmitLogin(false);
    }
  };

  const handleSubmitChangePass = async (e) => {
    e.preventDefault(); 
    toast.dismiss();
    if(isEmpty(passForm.username) || isEmpty(passForm.newpassword) || isEmpty(passForm.confirmpassword)) {
      toast.warning(messages.required, { autoClose: true });
    }
    else if(passForm.newpassword != passForm.confirmpassword) {
      toast.error("Password did not match!", { autoClose: true });
    }
    else {
      setSubmitLogin(true);
      try {
        const response = await axios.post(apiRoutes.setpermanentpassword, passForm);
        passToSuccessLogs(response.data.message, currentFileName);
        let changepass = response.data.changepass;
        if (changepass) {
          toast.success(`${response.data.message}`, { autoClose: true });
          setNewUser(false);
          setFormData(prevState => ({ ...prevState,  password: "", }));
        }
        else {  
          toast.error(`${response.data.message}`, { autoClose: true });
        }
      } catch (error) {
          toast.error(`Change passsword failed! ${error}`, { autoClose: true });
          passToErrorLogs(error, currentFileName);
      }
      setSubmitLogin(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const HandleShowPassword = () => setShowPassword(!showPassword);

  return (
    <>
    {status == 1 && !isLoading ? 
    <>
    {submitLogin && <FixedLoading />}
    {newUser ?    
    <CoverLayout
      title="Campus Voting System"
      description="Set Permanent Password"
      image={logo}
    >
      <SoftBox component="form" role="form" onSubmit={handleSubmitChangePass}>
        <SoftBox mb={1}>
          <SoftBox ml={0.5}>
            <SoftTypography component="span" variant="caption" fontWeight="bold" color="white" mt={1} >
              LRN:            
            </SoftTypography>
            <SoftTypography component="span" variant="caption" fontWeight="bold" color="warning" >
              {passForm.username || ""}              
            </SoftTypography>
            <br></br>
            <SoftTypography component="label" variant="caption" fontWeight="bold" color="white" >
              New password
            </SoftTypography>
          </SoftBox>
          <SoftInput disabled={submitChangePass} size="small" type={showPassword ? "text" : "password"}  name="newpassword" value={passForm.newpassword} onChange={handlePassChange}/>
        </SoftBox>
        <SoftBox mb={1}>          
          <SoftBox ml={0.5}>
            <SoftTypography component="label" variant="caption" fontWeight="bold" color="white">
              Confirm New Password
            </SoftTypography>
          </SoftBox>
          <SoftInput disabled={submitChangePass} size="small" type="password" name="confirmpassword" value={passForm.confirmpassword} onChange={handlePassChange} />
        </SoftBox>
        <SoftBox mt={2} mb={1}>
          <SoftButton type="submit" size="small" variant="gradient" color="success" fullWidth>
            Chage Password
          </SoftButton>
        </SoftBox>
        <SoftBox display={{ sm: "flex" }} justifyContent="space-between" textAlign={{ xs: "start", sm: "end" }}>
          <SoftBox display="flex" alignItems="center" py={1}>
              <Checkbox checked={showPassword} onChange={HandleShowPassword} />
              <SoftTypography 
                variant="button"
                className="text-xxs text-nowrap"
                color="white"
                fontWeight="regular"
                onClick={HandleShowPassword}
                sx={{ cursor: "poiner", userSelect: "none" }}
              >
                &nbsp;Show New Password
              </SoftTypography>
          </SoftBox> 
        </SoftBox>
        <SoftBox mt={1} mb={0}>
          <SoftTypography className="text-xxs" fontWeight="regular" color="white">
            <b>Note:</b> Use your new password the next time you login.
          </SoftTypography>
        </SoftBox>
      </SoftBox>
    </CoverLayout>
    :
    <CoverLayout
      title="Campus Voting System"
      description="Login Account"
      image={logo}
    >
      <SoftBox component="form" role="form" onSubmit={handleSubmit}>
        <SoftBox mb={1}>
          <SoftBox ml={0.5}>
            <SoftTypography component="label" variant="caption" fontWeight="bold" color="white" >
              Learner Reference Number (LRN)
            </SoftTypography>
          </SoftBox>
          <SoftInput disabled={submitLogin} size="small" type="text"  name="username" value={formData.username} onChange={handleChange}/>
        </SoftBox>
        <SoftBox mb={1}>          
          <SoftBox ml={0.5}>
            <SoftTypography component="label" variant="caption" fontWeight="bold" color="white">
              Password
            </SoftTypography>
          </SoftBox>
          <SoftInput disabled={submitLogin} size="small" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} />
        </SoftBox>
        <SoftBox mt={2} mb={1}>
          <SoftButton type="submit" size="small" variant="gradient" color="success" fullWidth>
            sign in
          </SoftButton>
        </SoftBox>
        <SoftBox display={{ sm: "flex" }} justifyContent="space-between" textAlign={{ xs: "start", sm: "end" }}>
          <SoftTypography 
              py={1}
              className="text-nowrap text-xxs  text-decoration-underline me-3"
              component={Link}
              to="/authentication/forgot-password"
              color="white"
              fontWeight="bold"
              // textGradient
            >
              Forgot Password?
          </SoftTypography> 
          <SoftTypography 
              py={1}
              className="text-nowrap text-xxs  text-decoration-underline"
              component={Link}
              to="/authentication/sign-in/admin"
              color="warning"
              fontWeight="bold"
              // textGradient
            >
              Login as Admin?
          </SoftTypography> 
        </SoftBox>
        <SoftBox mb={1}>
          <SoftBox display="flex" alignItems="center" py={1}>
              <Checkbox checked={showPassword} onChange={HandleShowPassword} />
              <SoftTypography 
                variant="button"
                className="text-xxs text-nowrap"
                color="white"
                fontWeight="regular"
                onClick={HandleShowPassword}
                sx={{ cursor: "poiner", userSelect: "none" }}
              >
                &nbsp;Show Password
              </SoftTypography>
          </SoftBox>
        </SoftBox>
        <SoftBox mt={1} mb={0}>
          <SoftTypography className="text-xxs" fontWeight="regular" color="white">
            <b>Note:</b> For first time login, please use default password given to you by your admin. You will be required to set your permanent password.
          </SoftTypography>
        </SoftBox>
      </SoftBox>
      
    </CoverLayout> 
    }
    </> : <MainLoading />
    }
    <ToastContainer
        position="bottom-right"
        autoClose={5000}
        limit={5}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        theme="light"
      />
    </>
  );
}

export default SignIn;
