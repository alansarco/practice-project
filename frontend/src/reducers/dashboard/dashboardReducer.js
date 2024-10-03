// reducers.js
import * as actionTypes from './actionTypes';

const initialState = {
  authUser: [],
  polls: [],
  loadAuthUser: true,
  otherStats: [],
  loadOtherStats: true,
  sales: [],
  loadSales: true,
  errormessage: "Something went wrong!",
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_AUTHUSER:
      return {
        ...state,
        authUser: action.data.authorizedUser,
        polls: action.data.polls,
        loadAuthUser: false,
      };

    case actionTypes.FETCH_AUTHUSER_FAIL:
      return {
        ...state,
        errormessage: "Error fetching authorized user, please check your internet connection",
        loadAuthUser: false,
      };

    case actionTypes.FETCH_OTHERSTATS:
      return {
        ...state,
        otherStats: action.data.otherStats,
        loadOtherStats: false,
      };

    case actionTypes.FETCH_OTHERSTATS_FAIL:
      return {
        ...state,
        errormessage: "Error fetching otherstats data, please check your internet connection",
        loadOtherStats: false,
      };

    case actionTypes.FETCH_SALES:
      return {
        ...state,
        sales: action.data.sales,
        loadSales: false,
      };

    case actionTypes.FETCH_SALES_FAIL:
      return {
        ...state,
        errormessage: "Error fetching sales data, please check your internet connection",
        loadSales: false,
      };

    default:
      return state;
  }
};

export default dashboardReducer;
