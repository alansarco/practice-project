// React layouts
import Dashboard from "layouts/dashboard";
import Admins from "layouts/admins";
import Users from "layouts/users";
import Ongoing from "layouts/elections/ongoing";
import Upcoming from "layouts/elections/upcoming";
import Archive from "layouts/elections/archive";
import Blank from "layouts/blank";
import Juniors from "layouts/junior";
import Announcements from "layouts/announcements";
import Seniors from "layouts/senior";
import Profile from "layouts/profile";
import Application from "layouts/elections/application";
import MyApplications from "layouts/myapplications";
import MyVotes from "layouts/myvotes";
import Settings from "layouts/settings";

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
import CalendarMonthTwoToneIcon from '@mui/icons-material/CalendarMonthTwoTone';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';

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
  access >= 10 && { type: "title", title: "Accounts", key: "account-pages" },
  access >= 10 && {
    type: "collapse",
    name: "Users",
    key: "users",
    route: "/users",
    icon: <GroupTwoToneIcon size="12px" />,
    component: <Users />,
    noCollapse: true,
  },
  access >= 10 && {
    type: "collapse",
    name: "Admins",
    key: "admins",
    route: "/admins",
    icon: <AdminPanelSettingsTwoToneIcon size="12px" />,
    component: <Admins />,
    noCollapse: true,
  },

  access >= 10 && { type: "title", title: "Students", key: "student-pages" },
  access >= 10 && {
    type: "collapse",
    name: "Junior HS",
    key: "juniors",
    route: "/juniors",
    icon: <FaceTwoToneIcon size="12px" />,
    component: <Juniors />,
    noCollapse: true,
  },
  access >= 10 && {
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
    component: <Ongoing />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Upcoming",
    key: "upcoming",
    route: "/upcoming",
    icon: <CalendarMonthTwoToneIcon size="12px" />,
    component: <Upcoming />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Application",
    key: "application",
    route: "/application",
    icon: <PendingActionsTwoToneIcon size="12px" />,
    component: <Application />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Archive",
    key: "archive",
    route: "/archive",
    icon: <MoveToInboxTwoToneIcon size="12px" />,
    component: <Archive />,
    noCollapse: true,
  },
  access == 5 && { type: "title", title: "My Pages", key: "my-pages" },
  access == 5 && {
    type: "collapse",
    name: "My Applications",
    key: "my-applications",
    route: "/my-applications",
    icon: <DescriptionTwoToneIcon size="12px" />,
    component: <MyApplications />,
    noCollapse: true,
  },
  access == 5 && {
    type: "collapse",
    name: "My Votes",
    key: "my-votes",
    route: "/my-votes",
    icon: <PollTwoToneIcon size="12px" />,
    component: <MyVotes />,
    noCollapse: true,
  },
  { type: "title", title: "Other Pages", key: "other-pages" },
  {
    type: "collapse",
    name: "Announcements",
    key: "announcements",
    route: "/announcements",
    icon: <CampaignTwoToneIcon size="12px" />,
    component: <Announcements />,
    noCollapse: true,
  },
  access == 999 && {
    type: "collapse",
    name: "System Settings",
    key: "settings",
    route: "/settings",
    icon: <SettingsTwoToneIcon size="12px" />,
    component: <Settings />,
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
