// React layouts
import Dashboard from "layouts/dashboard";
import Admins from "layouts/admins";
import Users from "layouts/users";
import Projects from "layouts/projects";
import Requests from "layouts/requests";
import History from "layouts/history";
import Application from "layouts/application";
import Blank from "layouts/blank";
import Juniors from "layouts/junior";
import Announcements from "layouts/announcements";

import SignIn from "layouts/authentication/sign-in";
import AdminSignIn from "layouts/authentication/sign-in/admin";
import SignUp from "layouts/authentication/sign-up";

import Shop from "essentials/Icons/Shop";
import AdminPanelSettingsTwoToneIcon from '@mui/icons-material/AdminPanelSettingsTwoTone';
import GroupTwoToneIcon from '@mui/icons-material/GroupTwoTone';
import FaceTwoToneIcon from '@mui/icons-material/FaceTwoTone';
import SchoolTwoToneIcon from '@mui/icons-material/SchoolTwoTone';
import HowToVoteTwoToneIcon from '@mui/icons-material/HowToVoteTwoTone';
import PendingActionsTwoToneIcon from '@mui/icons-material/PendingActionsTwoTone';
import MoveToInboxTwoToneIcon from '@mui/icons-material/MoveToInboxTwoTone';
import GroupsTwoToneIcon from '@mui/icons-material/GroupsTwoTone';
import CampaignTwoToneIcon from '@mui/icons-material/CampaignTwoTone';
import PollTwoToneIcon from '@mui/icons-material/PollTwoTone';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import Seniors from "layouts/senior";
import Profile from "layouts/profile";

// Accept access as a parameter
const routes = (access) => [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    route: "/dashboard",
    icon: <Shop size="12px" />,
    component: <Dashboard />,
    noCollapse: true,
  },

  // Conditionally render the Accounts menu and its submenus based on access
  access >= 999 && { type: "title", title: "Accounts", key: "account-pages" },
  access >= 999 && {
    type: "collapse",
    name: "Users",
    key: "users",
    route: "/users",
    icon: <GroupTwoToneIcon size="12px" />,
    component: <Users />,
    noCollapse: true,
  },
  access >= 999 && {
    type: "collapse",
    name: "Admins",
    key: "admins",
    route: "/admins",
    icon: <AdminPanelSettingsTwoToneIcon size="12px" />,
    component: <Admins />,
    noCollapse: true,
  },

  access >= 999 && { type: "title", title: "Students", key: "student-pages" },
  access >= 999 && {
    type: "collapse",
    name: "Junior HS",
    key: "juniors",
    route: "/juniors",
    icon: <FaceTwoToneIcon size="12px" />,
    component: <Juniors />,
    noCollapse: true,
  },
  access >= 999 && {
    type: "collapse",
    name: "Senior HS",
    key: "seniors",
    route: "/seniors",
    icon: <SchoolTwoToneIcon size="12px" />,
    component: <Seniors />,
    noCollapse: true,
  },
  { type: "title", title: "Elections", key: "election-pages" },
  {
    type: "collapse",
    name: "Ongoing",
    key: "ongoing",
    route: "/ongoing",
    icon: <HowToVoteTwoToneIcon size="12px" />,
    component: <Blank />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Upcoming",
    key: "upcoming",
    route: "/upcoming",
    icon: <PendingActionsTwoToneIcon size="12px" />,
    component: <Blank />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Archive",
    key: "archive",
    route: "/archive",
    icon: <MoveToInboxTwoToneIcon size="12px" />,
    component: <Blank />,
    noCollapse: true,
  },
  { type: "title", title: "Other Pages", key: "other-pages" },
  {
    type: "collapse",
    name: "Candidates",
    key: "candidates",
    route: "/candidates",
    icon: <GroupsTwoToneIcon size="12px" />,
    component: <Blank />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Announcements",
    key: "announcements",
    route: "/announcements",
    icon: <CampaignTwoToneIcon size="12px" />,
    component: <Announcements />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "My Votes",
    key: "my-votes",
    route: "/my-votes",
    icon: <PollTwoToneIcon size="12px" />,
    component: <Blank />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "About",
    key: "about",
    route: "/about",
    icon: <InfoTwoToneIcon size="12px" />,
    component: <Blank />,
    noCollapse: true,
  },
  {
    type: "",
    name: "Not Found",
    key: "not-found",
    route: "/not-found",
    icon: <InfoTwoToneIcon size="12px" />,
    component: <Blank />,
    noCollapse: true,
  },
  {
    type: "",
    name: "Profile",
    key: "change-password",
    route: "/change-password",
    icon: <InfoTwoToneIcon size="12px" />,
    component: <Profile />,
    noCollapse: true,
  },
  {
    type: "",
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    icon: <InfoTwoToneIcon size="12px" />,
    component: <SignIn />,
    noCollapse: true,
  },
  {
    type: "",
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in/admin",
    icon: <InfoTwoToneIcon size="12px" />,
    component: <AdminSignIn />,
    noCollapse: true,
  },
  {
    type: "",
    name: "Sign Up",
    key: "sign-up",
    route: "/authentication/sign-up",
    icon: <InfoTwoToneIcon size="12px" />,
    component: <SignUp />,
    noCollapse: true,
  },
].filter(Boolean); // Filter out `null` values from the array

export default routes;
