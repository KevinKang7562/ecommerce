//axios 인스턴스 생성 및 예외 처리를 위한 인터셉터

import axios from 'axios';
import { API_BASE_URL } from '../constants/api';
// import { authContext } from '../Auth/Auth';
import toast from 'react-hot-toast';
console.log('[api] axios instance loaded');

//axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =====================================================================
// 요청 인터셉터(token 없으면 그냥 통과)
// =====================================================================
api.interceptors.request.use(
  (config) => {
    // 🗑️ 불필요한 토큰 첨부 로직 삭제 (세션 쿠키가 자동으로 처리함)

    // JSON 헤더 쓰면 안 되므로 제거 (기존 로직 유지)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// =====================================================================
// 응답 인터셉터 (서버의 GlobalExceptionHandler에서 내려준 message 처리)
// =====================================================================
api.interceptors.response.use(
  (response) => response, //정상 응답처리
  (error) => {
    const message =
      error.response?.data?.message ?? '서버 오류가 발생했습니다.';

    // 401 Unauthorized: 로그인 필요(SessionCheckInterceptor에서 세션 없을 때 401 반환)
    if (error.response?.status === 401) {
      toast.error(message);
      localStorage.removeItem('authToken');
      // window(전역 객체)를 이용해 로그아웃 이벤트 발생 -> AuthContext에서 이 이벤트 감지하여 userToken 상태 null로 변경
      window.dispatchEvent(new CustomEvent('logout'));

      // 토스트를 보여준 뒤 로그인 페이지로 이동 (선택 사항: ProtectedRoute가 처리하지만, 확실한 처리를 위해 추가 가능)
      // 만약 SPA의 navigate를 쓰고 싶다면 AuthContext나 컴포넌트 레벨에서 처리하는 것이 좋으나,
      // 여기서는 강제 리다이렉트가 필요할 때를 위해 location.href를 고려할 수 있습니다.
      // 하지만 이미 AuthContext에서 이벤트를 감지하므로, ProtectedRoute가 있다면 자동으로 리다이렉트 됩니다.

      return Promise.reject(error);
    }

    //사용자 정의 필드인 meta로 에러메세지 표시 방식 alert와 ui inline 표시 중 선택(api 요청 시 meta: { errorType: 'INLINE' } 같이 설정, 없으면 기본값 ALERT)
    const errorType = error.config?.meta?.errorType ?? 'ALERT';
    if (errorType === 'ALERT') {
      toast.error(message);
    }
    return Promise.reject(error);
  },
);

export default api;
