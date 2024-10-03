import { createSelector, createStructuredSelector } from 'reselect';

const selectProjects = (state) => state.projects;

export const ProjectsData = createSelector( selectProjects, (projects) => projects.projects );
export const LoadingStatus = createSelector( selectProjects, (projects) => projects.isLoading );
export const ErrorMessage = createSelector( selectProjects, (projects) => projects.errormessage );

export const selectProjectsData = createStructuredSelector({
      projects: ProjectsData,
      isLoading: LoadingStatus,
      errormessage: ErrorMessage,
});
    