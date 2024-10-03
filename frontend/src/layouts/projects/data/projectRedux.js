import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from 'reducers/projects/actions';
import { selectProjectsData } from './selectors'; // Import the new selector
import { apiRoutes } from "components/Api/ApiRoutes";
import { useEffect } from 'react';
import { useStateContext } from "context/ContextProvider";
import { passToSuccessLogs, passToErrorLogs } from 'components/Api/Gateway';

export function useProjectsData(props) {
  const currentFileName = "layouts/projects/data/projectRedux.js";

  const {user, token} = useStateContext();
  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
    'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`    
  };
  
  const dispatch = useDispatch();

  // Use the new selector to get the ProjectsData
  const ProjectsData = useSelector(selectProjectsData);

  useEffect(() => {
    if(props.projects == 1) {
      axios.get(apiRoutes.projectRetrieve, {headers})
      .then(response => {
          dispatch(actions.fetchProjects(response.data));
          passToSuccessLogs(response.data, currentFileName);
      })
      .catch(error => {
          dispatch(actions.fetchProjectsFail(error));
          passToErrorLogs(`Projects data not fetched! ${error}`, currentFileName);
      });
    }
    }, [props.projects, dispatch]);
    
  return ProjectsData;
}
