import { createContext, useEffect, useState } from 'react';

export const authContext = createContext(null);

export default function AuthContextProvider(props) {
  const [userToken, setUserToken] = useState(null);
  // 추가: 초기 로딩 상태 (true일 때는 아직 토큰 확인 중임을 의미)
  const [isTokenLoading, setIsTokenLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setUserToken(savedToken);
    }
    // 토큰이 있든 없든 확인이 끝났으므로 로딩 완료
    setIsTokenLoading(false);
  }, []);

  return (
    // value에 isTokenLoading을 추가로 넘겨줍니다.
    <authContext.Provider value={{ userToken, setUserToken, isTokenLoading }}>
      {props.children}
    </authContext.Provider>
  );
}

// import { createContext, useEffect, useState } from 'react';

// export const authContext = createContext(null);

// export default function AuthContextProvider(props) {
//   const [userToken, setUserToken] = useState(null);

//   useEffect(() => {
//     if (localStorage.getItem('authToken')) {
//       setUserToken(localStorage.getItem('authToken'));
//     }
//   }, []);

//   return (
//     <authContext.Provider value={{ userToken, setUserToken }}>
//       {props.children}
//     </authContext.Provider>
//   );
// }
