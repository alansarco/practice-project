import { Checkbox, Grid } from "@mui/material";
import FixedLoading from "components/General/FixedLoading";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftInput from "components/SoftInput";
import SoftTypography from "components/SoftTypography";
import { toast } from "react-toastify";
import { messages } from "components/General/Messages";
import { useStateContext } from "context/ContextProvider";
import { passToErrorLogs, passToSuccessLogs } from "components/Api/Gateway";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";
import { useEffect, useState } from "react";
import VotingDateValidation from "components/General/VotingDateValidation";

function ApplyForm({ APPLICATION, REQ_LINK, POLL, HandleRendering, UpdateLoading }) {
    const currentFileName = "layouts/admins/components/Add/index.js";
    const [submitProfile, setSubmitProfile] = useState(false);
    const { token } = useStateContext();
    const pollid = POLL.pollid;
    const [fetchpositions, setFetchPositions] = useState([]);

    const YOUR_ACCESS_TOKEN = token;
    const headers = {
        'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
    };

    useEffect(() => {
        axios.get(apiRoutes.positionSelect, { params: { pollid }, headers })
            .then(response => {
                setFetchPositions(response.data.positions);
                passToSuccessLogs(response.data, currentFileName);
            })
            .catch(error => {
                passToErrorLogs(`Admin Data not Fetched!  ${error}`, currentFileName);
            });
    }, []);

    const initialState = {
        pollid: POLL.pollid ?? "",
        party: "",
        positionid: "",
        platform: "",
        requirements: null,
        id_picture: null,
        agreement: false,
    };

    const [formData, setFormData] = useState(initialState);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === "checkbox") {
            setFormData({ ...formData, [name]: !formData[name] });
        } else if (type === "file" && name === "requirements") {
            const file = files[0];
            if (file && (file.type === "application/zip" || file.name.endsWith(".zip"))) {
                setFormData({ ...formData, requirements: file });
            } else {
                toast.error("Only .zip files are allowed");
                e.target.value = null;
            }
        } 
        else if (type === "file" && name === "id_picture") {
            const file = files[0];
            console.log("IDE HERE")
            if (file && (file.type === "application/png" || file.name.endsWith(".png"))) {
                setFormData({ ...formData, id_picture: file });
            } else {
                toast.error("Only .png images are allowed");
                e.target.value = null;
            }
        } 
        else {
            setFormData((prevData) => {
                let updatedData = { ...prevData, [name]: value };
                const validatedData = VotingDateValidation({ name, updatedData, toast });
                return validatedData;
            });
        }
    };

    const handleCancel = () => {
        HandleRendering(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        toast.dismiss();

        const requiredFields = ["party", "platform", "positionid"];
        const emptyRequiredFields = requiredFields.filter(field => !formData[field]);

        if (emptyRequiredFields.length === 0 && formData.requirements) {
            if (!formData.agreement) {
                toast.warning(messages.agreement, { autoClose: true });
            } else {
                setSubmitProfile(true);
                try {
                    if (!token) {
                        toast.error(messages.prohibit, { autoClose: true });
                    } else {
                        const data = new FormData();
                        data.append("pollid", formData.pollid);
                        data.append("party", formData.party);
                        data.append("positionid", formData.positionid);
                        data.append("platform", formData.platform);
                        data.append("requirements", formData.requirements);
                        data.append("id_picture", formData.id_picture);

                        const response = await axios.post(apiRoutes.sumbitApplication, data, { headers });
                        if (response.data.status === 200) {
                            toast.success(`${response.data.message}`, { autoClose: true });
                        } else {
                            toast.error(`${response.data.message}`, { autoClose: true });
                        }
                        UpdateLoading(true);
                        passToSuccessLogs(response.data, currentFileName);
                    }
                } catch (error) {
                    toast.error("Error submitting Application!", { autoClose: true });
                    passToErrorLogs(error, currentFileName);
                }
                setSubmitProfile(false);
            }
        } else {
            toast.warning(messages.required, { autoClose: true });
        }
    };

    return (
        <>
            {submitProfile && <FixedLoading />}
            <SoftBox mt={5} mb={3} px={2}>
                <SoftBox mb={5} p={4} className="shadow-sm rounded-4 bg-white">
                    <SoftTypography fontWeight="medium" color="success" textGradient>
                        Direction!
                    </SoftTypography>
                    <SoftTypography fontWeight="bold" className="text-xs">
                        Please fill in the required fields. Rest assured that data is secured.
                    </SoftTypography>
                    <SoftTypography fontWeight="bold" className="text-xxs mt-2">
                        REMINDERS:
                    </SoftTypography>
                    <SoftTypography variant="p" className="text-xxs text-secondary span fst-italic">
                        (Please read before filling up the form)
                    </SoftTypography>
                    <ul className="text-danger fw-bold">
                            <li className="text-xxs fst-italic">You will receive an SMS notification once application is approved</li>
                            <li className="text-xxs fst-italic">You can apply one position only</li>
                            <li className="text-xxs fst-italic">Once aproved, you can no longer delete it</li>
                            <li className="text-xxs fst-italic">You cant apply position if party member has applied already</li>
                            <li className="text-xxs fst-italic">Your application will be approved by the admin</li>
                            <li className="text-xxs fst-italic">REQUIREMENTS must be in a .zip file</li>
                            <li className="text-xxs fst-italic">DOWNLOAD the necessary requirements by clicking the blue button</li>
                    </ul>
                    <SoftBox mt={2}>
                        <SoftButton
                            component="a"
                            href={REQ_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="gradient"
                            color="info"
                            className="mx-2 text-xxs px-3 rounded-pill"
                        >
                            Download Necessary Requirements
                        </SoftButton>
                    </SoftBox>
                    <SoftBox mt={2}>
                        <SoftBox component="form" role="form" className="px-md-0 px-2" onSubmit={handleSubmit}>
                            <SoftTypography fontWeight="medium" textTransform="capitalize" color="success" textGradient>
                                Application Information
                            </SoftTypography>
                            <Grid container spacing={0} alignItems="center">
                                <Grid item xs={12} md={6} lg={4} px={1}>
                                    <SoftTypography variant="button" className="me-1 text-nowrap"> Position: </SoftTypography>
                                    <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                    <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer" name="positionid" value={formData.positionid} onChange={handleChange}>
                                        <option value=""></option>
                                        {fetchpositions && fetchpositions.length > 0 && fetchpositions.map((position, index) => (
                                            <option key={index} value={position.positionid}>
                                                {position.position_name}
                                            </option>
                                        ))}
                                    </select>
                                </Grid>
                            </Grid>
                            <Grid container spacing={0} alignItems="center">
                                <Grid item xs={12} md={6} lg={4} px={1}>
                                    <SoftTypography variant="button" className="me-1">Partylist:</SoftTypography>
                                    <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                    <SoftInput name="party" value={formData.party.toLocaleUpperCase()} onChange={handleChange} size="small" />
                                </Grid>
                            </Grid>
                            <Grid container spacing={0} alignItems="center">
                                <Grid item xs={12} md={6} lg={4} px={1}>
                                    <SoftTypography variant="button" className="me-1">Picture:</SoftTypography>
                                    <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                    <input
                                        type="file"
                                        name="id_picture"
                                        accept=".png"
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={0} alignItems="center">
                                <Grid item xs={12} md={6} lg={4} px={1}>
                                    <SoftTypography variant="button" className="me-1">Requirements:</SoftTypography>
                                    <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                    <input
                                        type="file"
                                        name="requirements"
                                        accept=".zip"
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={12} md={12} px={1}>
                                    <SoftTypography variant="button" className="me-1">Advocacy:</SoftTypography>
                                    <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                    <textarea placeholder="Describe what can you do for the betterment of the school" name="platform" value={formData.platform} onChange={handleChange} className="form-control text-secondary text-xs" rows="4"></textarea>
                                </Grid>
                            </Grid>
                            <Grid mt={3} container spacing={0} alignItems="center">
                                <Grid item xs={12} pl={1}>
                                    <Checkbox 
                                        className={` ${formData.agreement ? '' : 'border-2 border-success'}`} 
                                        name="agreement" 
                                        checked={formData.agreement} 
                                        onChange={handleChange} 
                                    />
                                    <SoftTypography variant="button" className="me-1 ms-2">Verify Data </SoftTypography>
                                    <SoftTypography variant="p" className="text-xxs text-secondary fst-italic">(Confirming that the information above are true and accurate) </SoftTypography>
                                    <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                </Grid>
                            </Grid>
                                    <Grid mt={3} container spacing={0} alignItems="center" justifyContent="end">
                                          <Grid item xs={12} sm={4} md={2} pl={1}>
                                                <SoftBox mt={2} display="flex" justifyContent="end">
                                                      <SoftButton onClick={handleCancel} className="mx-2 w-100 text-xxs px-3 rounded-pill" size="small" color="light">
                                                            Back
                                                      </SoftButton>
                                                </SoftBox>
                                          </Grid>
                                          <Grid item xs={12} sm={4} md={2} pl={1}>
                                                <SoftBox mt={2} display="flex" justifyContent="end">
                                                      <SoftButton variant="gradient" type="submit" className="mx-2 w-100 text-xxs px-3 rounded-pill" size="small" color="success">
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

export default ApplyForm;
