import { createContext, useEffect, useState } from 'react';
import { AUTH_PATH } from '../../constants/api';
import api from '../../api/axios';

/**
 * ============================================================================
 * 🔐 Auth Context Provider (로그인 상태 관제탑)
 * * 이 파일은 앱 전체의 "내 정보(토큰)"를 담아두는 전역 금고입니다.
 * * [역할 및 흐름]
 * - 앱이 켜지자마자 가장 먼저 실행되어 내 브라우저 창고(localStorage)를 뒤집니다.
 * - 토큰이 발견되면 백엔드(/me.do)에 물어봐서 유효한 토큰인지 검사합니다.
 * - 검사가 통과되면 userToken 상태에 값을 채워 쇼핑몰 전체를 '로그인 상태'로 만듭니다.
 * - 다른 컴포넌트(헤더, 마이페이지 등)는 여기서 userToken을 꺼내어 권한을 체크합니다.
 * ============================================================================
 */
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
  // const [userNo, setUserNo] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isTokenLoading, setIsTokenLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');

    if (savedToken) {
      setUserToken(savedToken);
    }

    api
      .post(`${AUTH_PATH}/me.do`, {}, { meta: { errorType: 'INLINE' } })
      .then((response) => {
        const sessionUser = response.data?.data;

        if (sessionUser?.authenticated) {
          setUserToken(savedToken || extractToken(sessionUser) || sessionUser);
          // userNo 저장 (sessionUser 객체 또는 savedToken 기반)
          // if (sessionUser?.userNo) {
          //   setUserNo(sessionUser.userNo);
          // }
        } else {
          setUserToken(null);
          // setUserNo(null);
        }
      })
      .catch(() => {
        setUserToken(savedToken || null);
        // setUserNo(null);
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
        // userNo,
        // setUserNo,
        authLoading,
        setAuthLoading,
        isTokenLoading,
      }}
    >
      {props.children}
    </authContext.Provider>
  );
}
