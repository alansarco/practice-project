import { createSelector, createStructuredSelector } from 'reselect';

const selectProjects = (state) => state.elections;

export const ElectionsData = createSelector( selectProjects, (elections) => elections.elections );
export const LoadingStatus = createSelector( selectProjects, (elections) => elections.isLoading );
export const ErrorMessage = createSelector( selectProjects, (elections) => elections.errormessage );

export const selectProjectsData = createStructuredSelector({
      elections: ElectionsData,
      isLoading: LoadingStatus,
      errormessage: ErrorMessage,
});
    