import { useEffect, useState } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus, InteractionRequiredAuthError } from '@azure/msal-browser';
import { Navigate, useLocation } from 'react-router-dom';
import { loginRequest } from '../auth/authConfig';

interface ProtectedRouteProps {
  children: JSX.Element;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      if (!isAuthenticated && inProgress === InteractionStatus.None) {
        try {
          // Store the current location before redirecting
          sessionStorage.setItem('redirectPath', location.pathname + location.search);
          
          // Attempt silent token acquisition first
          await instance.acquireTokenSilent(loginRequest);
          setIsChecking(false);
        } catch (error) {
          if (error instanceof InteractionRequiredAuthError) {
            try {
              // If silent acquisition fails, try redirect
              await instance.loginRedirect({
                ...loginRequest,
                redirectStartPage: location.pathname + location.search
              });
            } catch (redirectError) {
              setAuthError('Failed to initiate login');
              setIsChecking(false);
            }
          } else {
            setAuthError('Authentication failed');
            setIsChecking(false);
          }
        }
      } else {
        setIsChecking(false);
      }
    };

    handleAuth();
  }, [isAuthenticated, inProgress, instance, location]);

  useEffect(() => {
    // After successful authentication, check for stored redirect path
    if (isAuthenticated && !isChecking) {
      const redirectPath = sessionStorage.getItem('redirectPath');
      if (redirectPath && location.pathname === '/') {
        sessionStorage.removeItem('redirectPath');
        window.location.href = redirectPath;
      }
    }
  }, [isAuthenticated, isChecking, location.pathname]);

  if (isChecking || inProgress !== InteractionStatus.None) {
    return <div>Loading...</div>;
  }

  if (authError) {
    return <div>Error: {authError}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};
