// reducers.js
import { FETCH_PROJECTS, FETCH_PROJECTS_FAIL } from './actionTypes';

const initialState = {
  projects: [],
  errormessage: "Something went wrong!",
  isLoading: true,
};

const projectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PROJECTS:
      return {
        ...state,
        projects: action.data.projects,
        isLoading: false,
      };
    case FETCH_PROJECTS_FAIL:
      return {
        ...state,
        errormessage: "Error fetching data, check your internet connection!",
        isLoading: false,
      };
    default:
      return state;
  }
};

export default projectsReducer;
