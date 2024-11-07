import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { checkUserAccess, UserAccessLevel } from '../auth/authService';

interface GroupProtectedRouteProps {
  children: JSX.Element;
  requiredAccess: UserAccessLevel;
}

const GroupProtectedRoute: React.FC<GroupProtectedRouteProps> = ({ 
  children, 
  requiredAccess 
}) => {
  const [userAccess, setUserAccess] = useState<UserAccessLevel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAccess = async () => {
      try {
        const access = await checkUserAccess();
        setUserAccess(access);
      } catch (error) {
        console.error('Error checking user access:', error);
        setUserAccess('none');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAccess();
  }, []);

  if (isLoading) {
    return <div>Checking access...</div>;
  }

  // Allow admin users to access everything
  if (userAccess === 'admin') {
    return children;
  }

  // For regular users, only allow if the required access is 'user'
  if (userAccess === 'user' && requiredAccess === 'user') {
    return children;
  }

  // Redirect to home page if access is denied
  return <Navigate to="/" replace />;
};

export default GroupProtectedRoute;
