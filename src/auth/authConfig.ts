import { Configuration, PublicClientApplication } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// Separate scopes for Dynamics and Microsoft Graph
export const loginRequestDynamics = {
  scopes: [`${process.env.REACT_APP_DYNAMICS_URI}/.default`]
};

export const loginRequestGraph = {
  scopes: ['GroupMember.Read.All', 'openid', 'profile', 'offline_access']
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const initializeMsal = async () => {
  await msalInstance.initialize();
  return msalInstance.handleRedirectPromise().catch(error => {
    console.error('Error handling redirect:', error);
  });
};
