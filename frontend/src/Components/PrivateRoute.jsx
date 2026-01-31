import React from 'react';
import useAuth from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {

  const { authUser, loading } = useAuth();

  // While checking cookie auth
  if (loading) {
    return (
      <p className='text-center text-xl font-semibold text-blue-500'>
        Loading...
      </p>
    );
  }

  // If not logged in
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  // If logged in
  return children;

};

export default PrivateRoute;
