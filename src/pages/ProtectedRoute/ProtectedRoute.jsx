import { Navigate } from 'react-router-dom';
import { authContext } from '../../context/Auth/Auth';
import { useContext } from 'react';

export default function ProtectedRoute(props) {
  const { userToken, isTokenLoading } = useContext(authContext);

  // [수정 이유] 새로고침 시 리액트 상태 초기화에 따른 원치 않는 리다이렉트 방지
  // 1. 새로고침 시 AuthContext가 로컬 스토리지에서 토큰을 읽어오는 동안 userToken은 잠시 null이 됨.
  // 2. 기존 코드는 이 찰나의 순간을 '로그아웃 상태'로 오판하여 ProtectedRoute가 /login으로 튕겨냄.
  // 3. 그 직후 토큰 복구가 완료되면 RedirectIfAuthenticated가 다시 메인(/)으로 던지는 '핑퐁' 현상 발생.
  // 4. 따라서 isTokenLoading 상태를 도입하여 토큰 확인이 끝날 때까지 렌더링을 대기함.

  // 로딩 중이라면 리다이렉트 시키지 않고 null이나 로딩 바를 보여줍니다.
  if (isTokenLoading) {
    return null; // 혹은 <LoadingSpinner /> 같은 컴포넌트
  }

  if (userToken) {
    return props.children;
  } else {
    // 토큰 확인이 확실히 끝났는데(isTokenLoading: false) 없을 때만 로그인으로 보냄
    return <Navigate to="/login" />;
  }
}

// import { Navigate } from 'react-router-dom';
// import { authContext } from '../../context/Auth/Auth';
// import { useContext } from 'react';

// export default function ProtectedRoute(props) {
//   const { userToken } = useContext(authContext);

//   if (userToken) {
//     return props.children;
//   } else {
//     return <Navigate to="/login" />;
//   }
// }
