import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useLocation, useNavigate } from 'react-router-dom';
import { ensureAuth, hasAppAccess } from '../auth/authService';
import { loginRequestDynamics } from '../auth/authConfig';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const AccessDeniedPage = () => (
  <div style={{ 
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5'
  }}>
    <img 
      src="/foxylogo.png" 
      alt="Foxy Logo" 
      style={{ 
        height: '60px', 
        marginBottom: '24px' 
      }} 
    />
    <div style={{
      padding: '24px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      textAlign: 'center',
      maxWidth: '400px'
    }}>
      <h2 style={{ 
        margin: '0 0 16px 0',
        color: '#434343'
      }}>Access Denied</h2>
      <p style={{ 
        margin: '0 0 8px 0',
        color: '#595959'
      }}>You do not have permission to access this application.</p>
      <p style={{ 
        margin: '0',
        color: '#8c8c8c',
        fontSize: '14px'
      }}>Please contact your administrator if you believe this is an error.</p>
    </div>
  </div>
);

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
    return (
      <div style={{ 
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5'
      }}>
        Checking authentication...
      </div>
    );
  }

  if (accessDenied) {
    return <AccessDeniedPage />;
  }

  return isAuthorized ? children : (
    <div style={{ 
      height: '100vh',
      width: '100vw',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f2f5'
    }}>
      Redirecting to login...
    </div>
  );
};
