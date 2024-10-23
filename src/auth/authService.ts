import { msalInstance } from './authConfig';
import { loginRequest } from './authConfig';

export const getAccessToken = async (): Promise<string> => {
  try {
    const account = msalInstance.getAllAccounts()[0];
    if (!account) {
      throw new Error('No active account! Please sign in first.');
    }

    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account
    });

    return response.accessToken;
  } catch (error) {
    // If silent token acquisition fails, fallback to interactive sign in
    await msalInstance.loginRedirect(loginRequest);
    // This line won't be reached as loginRedirect causes a redirect
    throw new Error('Authentication required');
  }
};
