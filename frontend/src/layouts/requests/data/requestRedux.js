import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from 'reducers/requests/actions';
import { selectRequestsData } from './selectors'; // Import the new selector
import { apiRoutes } from "components/Api/ApiRoutes";
import { useEffect } from 'react';
import { useStateContext } from "context/ContextProvider";
import { passToSuccessLogs, passToErrorLogs } from 'components/Api/Gateway';

export function useRequestsData(props) {
  const currentFileName = "layouts/requests/data/requestRedux.js";

  const {user, token} = useStateContext();
  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
    'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`    
  };
  
  const dispatch = useDispatch();

  // Use the new selector to get the RequestsData
  const RequestsData = useSelector(selectRequestsData);

  useEffect(() => {
    if(props.requests == 1) {
      axios.get(apiRoutes.requestRetrieve, {headers})
        .then(response => {
            dispatch(actions.fetchRequests(response.data));
            passToSuccessLogs(response.data, currentFileName);
        })
        .catch(error => {
            dispatch(actions.fetchRequestsFail(error));
            passToErrorLogs(`Requests data not fetched! ${error}`, currentFileName);
        });
    }
  }, [props.requests, dispatch]);
    
  return RequestsData;
}
