export const mainRoute = "http://127.0.0.1:8000";
// export const mainRoute = "https://hammerhead-app-obfxp.ondigitalocean.app/app";

export const apiRoutes = {  
    login: `${mainRoute}/api/login`,
    setpermanentpassword: `${mainRoute}/api/setpermanentpassword`,
    signupsuffixRetrieve: `${mainRoute}/api/signupsuffix`,
    signupuser: `${mainRoute}/api/signupuser`,
    createotp: `${mainRoute}/api/createotp`,

    app_infoRetrieve: `${mainRoute}/api/app_info`,

    authUserRetrieve: `${mainRoute}/api/user`,
    doLogout: `${mainRoute}/api/user`,
    
    adminRetrieve: `${mainRoute}/api/admins`,
    adminRetrieveOne: `${mainRoute}/api/admins/retrieve`,
    addAdmin: `${mainRoute}/api/admins/addadmin`,
    adminUpdate: `${mainRoute}/api/admins/update`,
    deleteAdmin: `${mainRoute}/api/admins/deleteadmin`,
    adminSelect: `${mainRoute}/api/admins/adminselect`,

    userRetrieve: `${mainRoute}/api/users`,
    userChangePass: `${mainRoute}/api/users/changepass`,
    personalChangePass: `${mainRoute}/api/users/personalchangepass`,
    addUser: `${mainRoute}/api/users/adduser`,
    userSelect: `${mainRoute}/api/users/userselect`,
    deleteUser: `${mainRoute}/api/users/deleteuser`,

    juniorRetrieve: `${mainRoute}/api/juniors`,
    seniorRetrieve: `${mainRoute}/api/seniors`,

    retrieveAnnouncement: `${mainRoute}/api/announcements`,
    retrieveAnnouncementOne: `${mainRoute}/api/announcements/retrieve`,
    addAnnouncement: `${mainRoute}/api/announcements/addannouncement`,
    deleteAnnouncement: `${mainRoute}/api/announcements/deleteannouncement`,
    updateAnnouncement: `${mainRoute}/api/announcements/updateannouncement`,

    accountRetrieve: `${mainRoute}/api/accounts`,
    accountRetrieveOne: `${mainRoute}/api/accounts/retrieve`,
    accountStore: `${mainRoute}/api/accounts/store`,
    accountDelete: `${mainRoute}/api/accounts/delete`,
    accountUpdate: `${mainRoute}/api/accounts/update`,
    addStudent: `${mainRoute}/api/accounts/addstudent`,

    projectRetrieve: `${mainRoute}/api/elections`,
    addProject: `${mainRoute}/api/elections/addproject`,
    editProject: `${mainRoute}/api/elections/editproject`,
    projectInfo: `${mainRoute}/api/elections/projectinfo`,
    deleteProject: `${mainRoute}/api/elections/deleteproject`,

    requestRetrieve: `${mainRoute}/api/requests`,
    requestorInfo: `${mainRoute}/api/requests/requestorinfo`,
    editRequest: `${mainRoute}/api/requests/editrequest`,

    suffixRetrieve: `${mainRoute}/api/suffix`,

    otherStatsRetrieve: `${mainRoute}/api/dashboard/otherStats`,
    pollsRetrieve: `${mainRoute}/api/dashboard/polls`,
    
    applicationRetrieve: `${mainRoute}/api/application`,
    orderNow: `${mainRoute}/api/application/ordernow`,
    cancelOrder: `${mainRoute}/api/application/cancelorder`,
    
    // Add more routes here
};  