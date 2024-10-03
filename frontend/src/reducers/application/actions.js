import * as actionTypes from './actionTypes';

export const fetchApplications = (data) => ({
  type: actionTypes.FETCH_APPLICATIONS,
  data,
});

export const fetchApplicationsFail = (error) => ({
  type: actionTypes.FETCH_APPLICATIONS_FAIL,
  error,
});