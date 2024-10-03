import { createSelector, createStructuredSelector } from 'reselect';

const selectApplications = (state) => state.applications;

export const ApplicationsData = createSelector( selectApplications, (applications) => applications.applications );
export const LoadingStatus = createSelector( selectApplications, (applications) => applications.isLoading );
export const ErrorMessage = createSelector( selectApplications, (applications) => applications.errormessage );

export const selectApplicationsData = createStructuredSelector({
      applications: ApplicationsData,
      isLoading: LoadingStatus,
      errormessage: ErrorMessage,
});
    