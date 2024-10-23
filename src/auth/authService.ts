import { msalInstance, loginRequest } from './authConfig';
import { AccountInfo, AuthenticationResult, InteractionRequiredAuthError } from '@azure/msal-browser';

export const getAccessToken = async (): Promise<string> => {
  let account = msalInstance.getAllAccounts()[0];
  
  if (!account) {
    throw new Error('No active account! Please sign in first.');
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: account as AccountInfo
    });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // If silent token acquisition fails, fallback to interactive method
      const response = await msalInstance.acquireTokenPopup(loginRequest);
      return response.accessToken;
    }
    throw error;
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
      // Try to get a token silently
      return await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account
      });
    }

    // No account found, trigger login
    await msalInstance.loginRedirect(loginRequest);
    return null;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
};
