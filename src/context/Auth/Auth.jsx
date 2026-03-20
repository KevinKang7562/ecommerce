import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
import { AUTH_BASE_URL } from '../../config/api';

export const authContext = createContext(null);

function extractToken(payload) {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  return payload.token || payload.authToken || payload.accessToken || null;
}

export default function AuthContextProvider(props) {
  const [userToken, setUserToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isTokenLoading, setIsTokenLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');

    if (savedToken) {
      setUserToken(savedToken);
    }

    axios
      .post(
        `${AUTH_BASE_URL}/me.do`,
        {},
        {
          withCredentials: true,
        },
      )
      .then((response) => {
        const sessionUser = response.data?.data;

        if (sessionUser?.authenticated) {
          setUserToken(savedToken || extractToken(sessionUser) || sessionUser);
        } else {
          setUserToken(null);
        }
      })
      .catch(() => {
        setUserToken(savedToken || null);
      })
      .finally(() => {
        setAuthLoading(false);
        setIsTokenLoading(false);
      });
  }, []);

  return (
    <authContext.Provider
      value={{
        userToken,
        setUserToken,
        authLoading,
        setAuthLoading,
        isTokenLoading,
      }}
    >
      {props.children}
    </authContext.Provider>
  );
}
