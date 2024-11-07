import { msalInstance, loginRequestDynamics, loginRequestGraph } from './authConfig';
import { AccountInfo, AuthenticationResult, InteractionRequiredAuthError } from '@azure/msal-browser';
import { Client } from "@microsoft/microsoft-graph-client";
import { Group } from "@microsoft/microsoft-graph-types";

// Define group IDs - these should match your Azure AD group IDs
const FULL_ACCESS_GROUP = 'Full Access';
const EMPLOYEE_GROUP = 'Employee';

export const getDynamicsAccessToken = async (): Promise<string> => {
  const account = msalInstance.getAllAccounts()[0];
  if (!account) {
    throw new Error('No active account! Please sign in first.');
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequestDynamics,
      account: account as AccountInfo
    });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const response = await msalInstance.acquireTokenPopup(loginRequestDynamics);
      return response.accessToken;
    }
    throw error;
  }
};

export const getGraphAccessToken = async (): Promise<string> => {
  const account = msalInstance.getAllAccounts()[0];
  if (!account) {
    throw new Error('No active account! Please sign in first.');
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequestGraph,
      account: account as AccountInfo
    });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const response = await msalInstance.acquireTokenPopup(loginRequestGraph);
      return response.accessToken;
    }
    throw error;
  }
};

export const getUserGroups = async (): Promise<string[]> => {
  try {
    const accessToken = await getGraphAccessToken();

    const client = Client.init({
      authProvider: (callback: (error: any, token: string) => void) => {
        callback(null, accessToken);
      },
    });

    const result = await client.api('/me/memberOf').get();
    return (result.value as Group[]).map(group => group.displayName || '');
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
};

export type UserAccessLevel = 'full' | 'employee' | 'none';

export const checkUserAccess = async (): Promise<UserAccessLevel> => {
  try {
    const groups = await getUserGroups();
    if (groups.includes(FULL_ACCESS_GROUP)) {
      return 'full';
    } else if (groups.includes(EMPLOYEE_GROUP)) {
      return 'employee';
    }
    return 'none';
  } catch (error) {
    console.error('Error checking user access:', error);
    return 'none';
  }
};

export const ensureAuth = async (): Promise<AuthenticationResult | null> => {
  try {
    // First try to handle any redirects
    const redirectResult = await msalInstance.handleRedirectPromise();
    if (redirectResult) {
      return redirectResult;
    }

    // Check if we have an active account
    const account = msalInstance.getAllAccounts()[0];
    if (account) {
      // Try to get a token silently for Dynamics (primary auth)
      return await msalInstance.acquireTokenSilent({
        ...loginRequestDynamics,
        account
      });
    }

    // No account found, trigger login with Dynamics scopes
    await msalInstance.loginRedirect(loginRequestDynamics);
    return null;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
};
