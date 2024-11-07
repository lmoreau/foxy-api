import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useLocation, useNavigate } from 'react-router-dom';
import { ensureAuth } from '../auth/authService';
import { loginRequestDynamics } from '../auth/authConfig';

interface ProtectedRouteProps {
  children: JSX.Element;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { instance, inProgress } = useMsal();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (inProgress !== InteractionStatus.None) {
          return;
        }

        // Store the current path for after login
        sessionStorage.setItem('loginRedirect', location.pathname + location.search);

        const authResult = await ensureAuth();
        if (authResult) {
          setIsAuthorized(true);
        } else {
          // If we don't have an auth result and we're not in the middle of acquiring one,
          // redirect to login
          instance.loginRedirect({
            ...loginRequestDynamics,
            redirectStartPage: location.pathname + location.search
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [instance, inProgress, location, navigate]);

  // Handle the loading state
  if (isChecking || inProgress !== InteractionStatus.None) {
    return <div>Checking authentication...</div>;
  }

  // If authorized, render the protected content
  return isAuthorized ? children : <div>Redirecting to login...</div>;
};
