import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { authContext } from '../../context/Auth/Auth';

export default function ProtectedRoute(props) {
  const { userToken, authLoading, isTokenLoading } = useContext(authContext);

  if (authLoading || isTokenLoading) {
    return null;
  }

  if (userToken) {
    return props.children;
  }

  return <Navigate to="/login" />;
}
