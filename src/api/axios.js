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
    const token = localStorage.getItem('authToken');
    //토큰 자동 첨부
    if (token) {
      config.headers.token = token;
    }
    // JSON 헤더 쓰면 안 되므로 제거
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
      // 토스트가 보여질 시간 1.5초 정도 벌어준 뒤에 페이지 이동
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
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
