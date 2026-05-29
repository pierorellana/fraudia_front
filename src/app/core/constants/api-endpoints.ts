export const API_ENDPOINTS = {
  health: {
    check: '/health',
  },
  uploads: {
    dataset: '/imports/file',
  },
  claims: {
    list: '/claims',
    detail: (claimId: string) => `/claims/${claimId}`,
    assess: (claimId: string) => `/claims/${claimId}/assess`,
  },
  risk: {
    topClaims: '/risk/top',
  },
  analytics: {
    summary: '/analytics/summary',
    providers: '/analytics/providers',
    alerts: '/analytics/alerts',
  },
  agent: {
    query: '/agent/query',
  },
};
