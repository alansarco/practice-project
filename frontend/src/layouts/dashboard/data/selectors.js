import { createSelector, createStructuredSelector } from 'reselect';

const selectDashboard = (state) => state.dashboard;

export const AuthUserData = createSelector( selectDashboard, (dashboard) => dashboard.authUser );
export const PollsData = createSelector( selectDashboard, (dashboard) => dashboard.polls );
export const loadAuthUser = createSelector( selectDashboard, (dashboard) => dashboard.loadAuthUser );

export const SalesData = createSelector( selectDashboard, (dashboard) => dashboard.sales );
export const loadSales = createSelector( selectDashboard, (dashboard) => dashboard.loadSales);

export const OtherStatsData = createSelector( selectDashboard, (dashboard) => dashboard.otherStats );
export const loadOtherStats = createSelector( selectDashboard, (dashboard) => dashboard.loadOtherStats );

export const ErrorMessage = createSelector( selectDashboard, (dashboard) => dashboard.errormessage );

export const selectDashboardData = createStructuredSelector({
  authUser: AuthUserData,
  polls: PollsData,
  loadAuthUser: loadAuthUser,

  sales: SalesData,
  loadSales: loadSales,

  otherStats: OtherStatsData,
  loadOtherStats: loadOtherStats,
  
  errormessage: ErrorMessage,
});
