import { msalInstance, loginRequestDynamics, loginRequestGraph } from './authConfig';
import { AccountInfo, AuthenticationResult, InteractionRequiredAuthError } from '@azure/msal-browser';
import { Client } from "@microsoft/microsoft-graph-client";
import { Group } from "@microsoft/microsoft-graph-types";

// Define group IDs - these should match your Azure AD group IDs
const ADMIN_GROUP = 'FOXY_LEDGER_ADMIN';
const USER_GROUP = 'FOXY_LEDGER_USER';

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

export type UserAccessLevel = 'admin' | 'user' | 'none';

export const checkUserAccess = async (): Promise<UserAccessLevel> => {
  try {
    const groups = await getUserGroups();
    
    // Check for admin access first
    if (groups.includes(ADMIN_GROUP)) {
      return 'admin';
    }
    
    // Then check for user access
    if (groups.includes(USER_GROUP)) {
      return 'user';
    }
    
    // If not in either group, no access
    return 'none';
  } catch (error) {
    console.error('Error checking user access:', error);
    return 'none';
  }
};

export const hasAppAccess = async (): Promise<boolean> => {
  const accessLevel = await checkUserAccess();
  // Only allow access if user is either an admin or basic user
  return accessLevel !== 'none';
};

export const ensureAuth = async (): Promise<AuthenticationResult | null> => {
  try {
    // First try to handle any redirects
    const redirectResult = await msalInstance.handleRedirectPromise();
    if (redirectResult) {
      // Check group membership immediately after redirect
      const hasAccess = await hasAppAccess();
      if (!hasAccess) {
        throw new Error('Access Denied: You do not have permission to access this application.');
      }
      return redirectResult;
    }

    // Check if we have an active account
    const account = msalInstance.getAllAccounts()[0];
    if (account) {
      // Check group membership before proceeding
      const hasAccess = await hasAppAccess();
      if (!hasAccess) {
        throw new Error('Access Denied: You do not have permission to access this application.');
      }
      
      // Try to get a token silently
      return await msalInstance.acquireTokenSilent({
        ...loginRequestDynamics,
        account
      });
    }

    // No account found, trigger login
    await msalInstance.loginRedirect(loginRequestDynamics);
    return null;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
};
