import { createSelector, createStructuredSelector } from 'reselect';

const selectRequests = (state) => state.requests;

export const RequestsData = createSelector( selectRequests, (requests) => requests.requests );
export const LoadingStatus = createSelector( selectRequests, (requests) => requests.isLoading );
export const ErrorMessage = createSelector( selectRequests, (requests) => requests.errormessage );

export const selectRequestsData = createStructuredSelector({
      requests: RequestsData,
      isLoading: LoadingStatus,
      errormessage: ErrorMessage,
});
    