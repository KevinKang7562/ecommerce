import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { authContext } from '../../context/Auth/Auth';

export default function RedirectIfAuthenticated(props) {
  const { userToken, authLoading } = useContext(authContext);

  if (authLoading) {
    return null;
  }

  if (userToken) {
    return <Navigate to="/" />;
  }

  return props.children;
}
