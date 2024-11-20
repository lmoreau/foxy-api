import { msalInstance, loginRequestDynamics, loginRequestGraph } from './authConfig';
import { AccountInfo, AuthenticationResult, InteractionRequiredAuthError } from '@azure/msal-browser';
import { Client } from "@microsoft/microsoft-graph-client";
import { Group } from "@microsoft/microsoft-graph-types";

// Performance measurement utilities
const _now = () => performance.now();
const _formatDuration = (start: number, end: number) => `${(end - start).toFixed(2)}ms`;

// Cache for tokens to reduce auth requests
interface TokenCache {
  token: string;
  expiresAt: number;
}

const tokenCache: Record<'dynamics' | 'graph', TokenCache | undefined> = {
  dynamics: undefined,
  graph: undefined
};

// Define group IDs - these should match your Azure AD group IDs
const ADMIN_GROUP = 'FOXY_LEDGER_ADMIN';
const USER_GROUP = 'FOXY_LEDGER_USER';

// Token cache helper functions
const isTokenValid = (cache?: TokenCache): boolean => {
  if (!cache) return false;
  // Consider token expired 5 minutes before actual expiration to be safe
  return cache.expiresAt > Date.now() + 5 * 60 * 1000;
};

const cacheToken = (type: 'dynamics' | 'graph', response: AuthenticationResult) => {
  tokenCache[type] = {
    token: response.accessToken,
    expiresAt: response.expiresOn?.getTime() || (Date.now() + 3600 * 1000) // Default 1 hour if no expiration
  };
};

export const getDynamicsAccessToken = async (): Promise<string> => {
  const startTime = _now();
  console.log('[Auth] Starting Dynamics token acquisition');

  try {
    // Check cache first
    const cachedDynamics = tokenCache.dynamics;
    if (cachedDynamics && isTokenValid(cachedDynamics)) {
      console.log(`[Auth] Using cached Dynamics token, valid for ${Math.floor((cachedDynamics.expiresAt - Date.now()) / 1000)}s`);
      return cachedDynamics.token;
    }

    const accountCheckStart = _now();
    const account = msalInstance.getAllAccounts()[0];
    console.log(`[Auth] Account check completed in ${_formatDuration(accountCheckStart, _now())}`);

    if (!account) {
      console.error('[Auth] No active account found');
      throw new Error('No active account! Please sign in first.');
    }

    try {
      const silentAuthStart = _now();
      console.log('[Auth] Attempting silent token acquisition');
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequestDynamics,
        account: account as AccountInfo
      });
      console.log(`[Auth] Silent token acquisition succeeded in ${_formatDuration(silentAuthStart, _now())}`);
      
      cacheToken('dynamics', response);
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        console.log('[Auth] Silent token acquisition failed, attempting popup');
        const popupStart = _now();
        const response = await msalInstance.acquireTokenPopup(loginRequestDynamics);
        console.log(`[Auth] Popup token acquisition completed in ${_formatDuration(popupStart, _now())}`);
        
        cacheToken('dynamics', response);
        return response.accessToken;
      }
      throw error;
    }
  } catch (error) {
    console.error('[Auth] Token acquisition failed:', error);
    console.error('[Auth] Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    throw error;
  } finally {
    console.log(`[Auth] Total Dynamics token acquisition took ${_formatDuration(startTime, _now())}`);
  }
};

export const getGraphAccessToken = async (): Promise<string> => {
  const startTime = _now();
  console.log('[Auth] Starting Graph token acquisition');

  try {
    // Check cache first
    const cachedGraph = tokenCache.graph;
    if (cachedGraph && isTokenValid(cachedGraph)) {
      console.log(`[Auth] Using cached Graph token, valid for ${Math.floor((cachedGraph.expiresAt - Date.now()) / 1000)}s`);
      return cachedGraph.token;
    }

    const accountCheckStart = _now();
    const account = msalInstance.getAllAccounts()[0];
    console.log(`[Auth] Account check completed in ${_formatDuration(accountCheckStart, _now())}`);

    if (!account) {
      console.error('[Auth] No active account found');
      throw new Error('No active account! Please sign in first.');
    }

    try {
      const silentAuthStart = _now();
      console.log('[Auth] Attempting silent token acquisition');
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequestGraph,
        account: account as AccountInfo
      });
      console.log(`[Auth] Silent token acquisition succeeded in ${_formatDuration(silentAuthStart, _now())}`);
      
      cacheToken('graph', response);
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        console.log('[Auth] Silent token acquisition failed, attempting popup');
        const popupStart = _now();
        const response = await msalInstance.acquireTokenPopup(loginRequestGraph);
        console.log(`[Auth] Popup token acquisition completed in ${_formatDuration(popupStart, _now())}`);
        
        cacheToken('graph', response);
        return response.accessToken;
      }
      throw error;
    }
  } catch (error) {
    console.error('[Auth] Token acquisition failed:', error);
    console.error('[Auth] Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    throw error;
  } finally {
    console.log(`[Auth] Total Graph token acquisition took ${_formatDuration(startTime, _now())}`);
  }
};

export const getUserGroups = async (): Promise<string[]> => {
  const startTime = _now();
  console.log('[Auth] Starting user groups fetch');

  try {
    const tokenStart = _now();
    const accessToken = await getGraphAccessToken();
    console.log(`[Auth] Graph token obtained in ${_formatDuration(tokenStart, _now())}`);

    const clientStart = _now();
    const client = Client.init({
      authProvider: (callback: (error: any, token: string) => void) => {
        callback(null, accessToken);
      },
    });

    console.log('[Auth] Fetching user groups from Graph API');
    const result = await client.api('/me/memberOf').get();
    console.log(`[Auth] Groups fetch completed in ${_formatDuration(clientStart, _now())}`);
    
    return (result.value as Group[]).map(group => group.displayName || '');
  } catch (error) {
    console.error('[Auth] Error fetching user groups:', error);
    console.error('[Auth] Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    return [];
  } finally {
    console.log(`[Auth] Total groups fetch operation took ${_formatDuration(startTime, _now())}`);
  }
};

export type UserAccessLevel = 'admin' | 'user' | 'none';

export const checkUserAccess = async (): Promise<UserAccessLevel> => {
  const startTime = _now();
  console.log('[Auth] Starting user access check');

  try {
    const groupsStart = _now();
    const groups = await getUserGroups();
    console.log(`[Auth] Groups fetched in ${_formatDuration(groupsStart, _now())}`);
    
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
    console.error('[Auth] Error checking user access:', error);
    console.error('[Auth] Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    return 'none';
  } finally {
    console.log(`[Auth] Total access check took ${_formatDuration(startTime, _now())}`);
  }
};

export const hasAppAccess = async (): Promise<boolean> => {
  const startTime = _now();
  const accessLevel = await checkUserAccess();
  console.log(`[Auth] App access check completed in ${_formatDuration(startTime, _now())}`);
  // Only allow access if user is either an admin or basic user
  return accessLevel !== 'none';
};

export const ensureAuth = async (): Promise<AuthenticationResult | null> => {
  const startTime = _now();
  console.log('[Auth] Starting auth check');

  try {
    // First try to handle any redirects
    const redirectStart = _now();
    console.log('[Auth] Handling redirect promise');
    const redirectResult = await msalInstance.handleRedirectPromise();
    console.log(`[Auth] Redirect handled in ${_formatDuration(redirectStart, _now())}`);

    if (redirectResult) {
      const accessStart = _now();
      const hasAccess = await hasAppAccess();
      console.log(`[Auth] Access check after redirect completed in ${_formatDuration(accessStart, _now())}`);
      if (!hasAccess) {
        return null;
      }
      return redirectResult;
    }

    // Check if we have an active account
    const account = msalInstance.getAllAccounts()[0];
    if (account) {
      const accessStart = _now();
      const hasAccess = await hasAppAccess();
      console.log(`[Auth] Access check for existing account completed in ${_formatDuration(accessStart, _now())}`);
      if (!hasAccess) {
        return null;
      }
      
      // Try to get a token silently
      const tokenStart = _now();
      const result = await msalInstance.acquireTokenSilent({
        ...loginRequestDynamics,
        account
      });
      console.log(`[Auth] Silent token acquisition completed in ${_formatDuration(tokenStart, _now())}`);
      return result;
    }

    // No account found, trigger login
    console.log('[Auth] No account found, triggering login redirect');
    await msalInstance.loginRedirect(loginRequestDynamics);
    return null;
  } catch (error) {
    console.error('[Auth] Auth error:', error);
    console.error('[Auth] Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    return null;
  } finally {
    console.log(`[Auth] Total auth check took ${_formatDuration(startTime, _now())}`);
  }
};
