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

    userChangePass: `${mainRoute}/api/users/changepass`,
    personalChangePass: `${mainRoute}/api/users/personalchangepass`,
    addUser: `${mainRoute}/api/users/adduser`,
    userSelect: `${mainRoute}/api/users/userselect`,
    deleteUser: `${mainRoute}/api/users/deleteuser`,

    juniorRetrieve: `${mainRoute}/api/juniors`,
    seniorRetrieve: `${mainRoute}/api/seniors`,

    adminSelect: `${mainRoute}/api/applications/adminselect`,

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

    //Election
    addElection: `${mainRoute}/api/elections/addelection`,
    editProject: `${mainRoute}/api/elections/editproject`,
    electionInfo: `${mainRoute}/api/elections/electioninfo`,
    editUpcoming: `${mainRoute}/api/elections/editupcoming`,
    editOngoing: `${mainRoute}/api/elections/editongoing`,
    editApplication: `${mainRoute}/api/elections/editapplication`,
    deleteElection: `${mainRoute}/api/elections/deleteelection`,
    positionSelect: `${mainRoute}/api/elections/positionselect`,
    checkIfApplied: `${mainRoute}/api/elections/checkifapplied`,
    sumbitApplication: `${mainRoute}/api/elections/sumbitapplication`,
    deleteApplication: `${mainRoute}/api/elections/deleteapplication`,
    viewApplications: `${mainRoute}/api/elections/viewapplications`,
    approveApplication: `${mainRoute}/api/elections/approveapplication`,
    rejectApplication: `${mainRoute}/api/elections/rejectapplication`,
    liveResult: `${mainRoute}/api/elections/liveresult`,
    archiveResult: `${mainRoute}/api/elections/archiveresult`,
    voteCandidates: `${mainRoute}/api/elections/votecandidates`,
    submitVote: `${mainRoute}/api/elections/submitvote`,

    myPages: `${mainRoute}/api/mypages`,
    myVotes: `${mainRoute}/api/mypages/myvotes`,

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