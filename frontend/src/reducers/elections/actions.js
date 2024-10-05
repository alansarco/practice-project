import { FETCH_PROJECTS, FETCH_PROJECTS_FAIL } from './actionTypes';

export const fetchProjects = (data) => ({
  type: FETCH_PROJECTS,
  data,
});

export const fetchProjectsFail = (error) => ({
  type: FETCH_PROJECTS_FAIL,
  error,
});
