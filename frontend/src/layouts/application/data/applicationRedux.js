import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from 'reducers/application/actions';
import { selectApplicationsData } from './selectors'; // Import the new selector
import { apiRoutes } from "components/Api/ApiRoutes";
import { useEffect } from 'react';
import { useStateContext } from "context/ContextProvider";
import { passToSuccessLogs, passToErrorLogs } from 'components/Api/Gateway';

export function useApplicationsData(props) {
  const currentFileName = "layouts/application/data/applicationRedux.js";

  const {user, token} = useStateContext();
  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
    'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`    
  };
  
  const dispatch = useDispatch();

  // Use the new selector to get the ApplicationsData
  const ApplicationsData = useSelector(selectApplicationsData);

  useEffect(() => {
    if(props.applications == 1) {
      axios.get(apiRoutes.applicationRetrieve, {headers})
        .then(response => {
            dispatch(actions.fetchApplications(response.data));
            passToSuccessLogs(response.data, currentFileName);
        })
        .catch(error => {
            dispatch(actions.fetchApplicationsFail(error));
            passToErrorLogs(`Applications data not fetched! ${error}`, currentFileName);
        });
    }
  }, [props.applications, dispatch]);
    
  return ApplicationsData;
}
