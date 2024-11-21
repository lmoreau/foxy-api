# Dynamics 365 (Dataverse) Authentication Implementation Guide

## Overview

This document details the authentication implementation for accessing Dynamics 365 (Dataverse) in a React application with Azure Functions backend. The application uses Azure AD authentication with user delegation to ensure all Dataverse operations are performed under the user's context.

## Architecture

The authentication flow involves three main components:
1. React Frontend (MSAL Authentication)
2. Azure Functions Backend (Token Relay)
3. Dynamics 365 Dataverse (Target System)

### Key Components

#### Frontend (React)
- MSAL (Microsoft Authentication Library) for handling OAuth flow
- Protected Routes for securing application routes
- Token acquisition and management
- API utilities for authenticated requests

#### Backend (Azure Functions)
- Token validation
- Request forwarding to Dataverse
- Error handling and response formatting

#### Environment Configuration
- Azure AD Application registration
- Dataverse connection settings
- Environment variables

## Implementation Details

### 1. Azure AD Configuration

1. Register an application in Azure AD:
   - Navigate to Azure Portal > Azure Active Directory > App Registrations
   - Create a new registration
   - Set redirect URI to your application URL (e.g., http://localhost:3000)
   - Enable implicit grant flow for access tokens
   - Add API permissions for Dynamics 365:
     - user_impersonation permission for Dynamics CRM

2. Required Application Settings:
```env
REACT_APP_CLIENT_ID=<your-client-id>
REACT_APP_TENANT_ID=<your-tenant-id>
REACT_APP_DYNAMICS_URI=https://your-org.crm.dynamics.com
```

### 2. Frontend Authentication Implementation

#### MSAL Configuration (src/auth/authConfig.ts)
```typescript
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [`${process.env.REACT_APP_DYNAMICS_URI}/.default`]
};
```

#### Authentication Service (src/auth/authService.ts)
```typescript
export const getAccessToken = async (): Promise<string> => {
  let account = msalInstance.getAllAccounts()[0];
  
  if (!account) {
    throw new Error('No active account! Please sign in first.');
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: account
    });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const response = await msalInstance.acquireTokenPopup(loginRequest);
      return response.accessToken;
    }
    throw error;
  }
};
```

#### Protected Route Implementation (src/components/ProtectedRoute.tsx)
```typescript
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { instance, inProgress } = useMsal();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (inProgress !== InteractionStatus.None) {
        return;
      }

      try {
        const authResult = await ensureAuth();
        if (authResult) {
          setIsAuthorized(true);
        } else {
          instance.loginRedirect({
            ...loginRequest,
            redirectStartPage: location.pathname + location.search
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, [instance, inProgress]);

  return isAuthorized ? children : <div>Authenticating...</div>;
};
```

### 3. Backend Implementation (Azure Functions)

#### Dataverse Authentication Helper (api/src/shared/dataverseAuth.ts)
```typescript
export function getDataverseHeaders(authHeader: string): Record<string, string> {
    if (!authHeader) {
        throw new Error('Authorization header is required');
    }

    return {
        'Authorization': authHeader,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Prefer': 'return=representation'
    };
}
```

#### Azure Function Implementation Example (api/src/functions/getAccountById.ts)
```typescript
export async function getAccountById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return { 
            status: 401, 
            body: "Authorization header is required"
        };
    }

    try {
        const formattedId = id.replace(/[{}]/g, '');
        const headers = getDataverseHeaders(authHeader);
        const apiUrl = `${dataverseUrl}/api/data/v9.2/accounts(${formattedId})`;

        const response = await axios.get(apiUrl, { headers });
        return { 
            body: JSON.stringify(response.data),
            headers: { 
                "Content-Type": "application/json"
            }
        };
    } catch (error) {
        // Error handling
    }
}
```

## Key Learnings and Best Practices

1. **Token Handling**
   - Always use the `.default` scope for Dataverse
   - Handle token refresh properly
   - Implement proper error handling for token acquisition

2. **GUID Formatting**
   - Always format GUIDs properly for Dataverse (remove curly braces)
   - Use consistent GUID formatting across all functions

3. **Error Handling**
   - Implement proper error handling at all levels
   - Return meaningful error messages
   - Log errors appropriately

4. **Security Considerations**
   - Never store tokens in localStorage
   - Use sessionStorage for MSAL cache
   - Implement proper CORS handling
   - Validate tokens on the backend

5. **Performance Optimization**
   - Implement token caching
   - Handle token refresh efficiently
   - Minimize authentication redirects

## Common Issues and Solutions

1. **401 Unauthorized Errors**
   - Verify correct scope configuration
   - Ensure proper token passing
   - Check GUID formatting

2. **Runtime Errors**
   - Handle authentication state properly
   - Check for interaction in progress
   - Implement proper error boundaries

3. **Token Refresh Issues**
   - Implement proper silent token refresh
   - Handle interaction required errors
   - Use proper scope configuration

## Testing Authentication

1. **Local Testing**
   ```bash
   # Start frontend
   npm start

   # Start Azure Functions
   cd api && npm start
   ```

2. **Verify Authentication**
   - Check network requests for proper headers
   - Verify token presence and format
   - Test error scenarios

## Deployment Considerations

1. **Environment Variables**
   - Set up proper environment variables
   - Use different Azure AD apps for different environments
   - Configure proper redirect URIs

2. **Security Headers**
   - Implement proper CORS configuration
   - Set up proper CSP headers
   - Configure proper Azure AD security settings

## References

1. [Microsoft Identity Platform Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/)
2. [Dataverse Web API Reference](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/overview)
3. [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser)
4. [Azure Functions Authentication](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook-trigger?tabs=python-v2%2Cin-process%2Cfunctionsv2&pivots=programming-language-typescript#authentication)
