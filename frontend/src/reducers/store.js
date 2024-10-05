// store.js
import { createStore, applyMiddleware,combineReducers  } from 'redux';
import thunk from 'redux-thunk';
import signinReducer from './signin/signinReducer';
import dashboardReducer from './dashboard/dashboardReducer';
import projectsReducer from './elections/projectsReducer';
import requestsReducer from './requests/requestsReducer';
import applicationsReducer from './application/applicationReducer';

// Combine multiple reducers into a single reducer
const rootReducer = combineReducers({
    signin: signinReducer,
    dashboard: dashboardReducer,
    elections: projectsReducer,
    requests: requestsReducer,
    applications: applicationsReducer,
  });
    
const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
