// reducers.js
import { FETCH_APPLICATIONS, FETCH_APPLICATIONS_FAIL } from './actionTypes';

const initialState = {
  applications: [],
  errormessage: "Something went wrong!",
  isLoading: true,
};

const applicationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_APPLICATIONS:
      return {
        ...state,
        applications: action.data.applications,
        isLoading: false,
      };
    case FETCH_APPLICATIONS_FAIL:
      return {
        ...state,
        errormessage: "Error fetching data, check your internet connection!",
        isLoading: false,
      };
    default:
      return state;
  }
};

export default applicationsReducer;
