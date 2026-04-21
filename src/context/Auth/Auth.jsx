import { createContext, useEffect, useState, useCallback } from 'react';
import { AUTH_PATH } from '../../constants/api';
import api from '../../api/axios';

/**
 * 🔐 Auth Context Provider (로그인 상태 관제탑)
 * - 앱 전체의 로그인 상태('LOGGED_IN' 또는 null)를 관리합니다.
 * - 로그인 상태 변경 시 localStorage도 함께 업데이트하여 다중 탭을 동기화합니다.
 */
export const authContext = createContext({});

export default function AuthContextProvider(props) {
  const [userToken, setUserToken] = useState(localStorage.getItem('authToken')); // 초기값
  const [authLoading, setAuthLoading] = useState(true);
  const [isTokenLoading, setIsTokenLoading] = useState(true);

  // 💡 핵심: 상태(State)와 스토리지(localStorage)를 동시에 업데이트하는 함수
  const updateAuth = useCallback((token) => {
    setUserToken(token);
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('email');
    }
  }, []);

  // 서버에 내 정보 묻기 (세션 체크)
  const checkAuthFromServer = useCallback(() => {
    return api
      .post(`${AUTH_PATH}/me.do`, {}, { meta: { errorType: 'INLINE' } })
      .then((response) => {
        const sessionUser = response.data?.data;
        if (sessionUser?.authenticated) {
          // 세션이 살아있으면 무조건 'LOGGED_IN' 유지
          updateAuth('LOGGED_IN');
        } else {
          // 세션이 죽어있으면 null로 초기화
          updateAuth(null);
        }
      })
      .catch(() => {
        // 서버 통신 실패 시 특별한 조치 없이 기존 상태 유지 (네트워크 불안정 대비)
      })
      .finally(() => {
        setAuthLoading(false);
        setIsTokenLoading(false);
      });
  }, [updateAuth]);

  useEffect(() => {
    // 앱 켜질 때 1회 세션 검증
    checkAuthFromServer();
  }, [checkAuthFromServer]);

  useEffect(() => {
    // 💡 axios 인터셉터에서 보내는 전역 로그아웃 이벤트 감지
    const handleLogout = () => updateAuth(null);

    // 💡 A창에서 로그인/로그아웃 시 B창(다른 탭)의 상태를 동기화하는 이벤트 감지
    const handleStorageChange = (e) => {
      if (e.key === 'authToken') {
        setUserToken(e.newValue);
      }
    };

    window.addEventListener('logout', handleLogout);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('logout', handleLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateAuth]);

  return (
    <authContext.Provider
      value={{
        userToken,
        setUserToken: updateAuth, // 다른 컴포넌트에서 setUserToken을 부르면 updateAuth가 실행됨
        authLoading,
        setAuthLoading,
        isTokenLoading,
      }}
    >
      {props.children}
    </authContext.Provider>
  );
}
