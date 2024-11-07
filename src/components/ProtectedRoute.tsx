import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useLocation, useNavigate } from 'react-router-dom';
import { ensureAuth, hasAppAccess } from '../auth/authService';
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
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (inProgress !== InteractionStatus.None) {
          return;
        }

        const account = instance.getAllAccounts()[0];
        
        if (account) {
          // Check group membership first
          const hasAccess = await hasAppAccess();
          if (!hasAccess) {
            setAccessDenied(true);
            setIsChecking(false);
            return;
          }

          const authResult = await ensureAuth();
          if (authResult) {
            setIsAuthorized(true);
          }
        } else {
          // No account, trigger initial login
          instance.loginRedirect({
            ...loginRequestDynamics,
            redirectStartPage: location.pathname + location.search
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAccessDenied(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [instance, inProgress, location, navigate]);

  if (isChecking) {
    return <div>Checking authentication...</div>;
  }

  if (accessDenied) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        marginTop: '50px' 
      }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this application.</p>
        <p>Please contact your administrator if you believe this is an error.</p>
      </div>
    );
  }

  return isAuthorized ? children : <div>Redirecting to login...</div>;
};
