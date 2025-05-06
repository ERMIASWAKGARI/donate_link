/* eslint-disable react/prop-types */
import { useUser } from '../context/UserContext';
import { Navigate, Outlet } from 'react-router-dom';

import { Spin } from 'antd';

import NotAuthorizedPage from '../pages/NotFound';

const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, accessToken, loading, isAuthenticating } = useUser();

  if (loading || isAuthenticating) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        <Spin size="large" />
      </div>
    );
  }

  if (!accessToken) return <Navigate to="/login" replace />;

  if (!user) return null;

  if (!allowedRoles.includes(user.role)) {
    return <NotAuthorizedPage />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;
