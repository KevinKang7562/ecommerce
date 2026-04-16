// export const API_BASE_URL = 'http://localhost:7080';
export const SESSION_ALERT = '세션이 종료되어 로그인이 필요합니다.';
export const IMAGE_BASE_URL =
  // import.meta.env.VITE_IMAGE_BASE_URL || 'http://10.100.102.27';
  // import.meta.env.VITE_IMAGE_BASE_URL || 'http://10.100.101.165'; //사무실 이전으로 아이피 변경
  import.meta.env.VITE_IMAGE_BASE_URL || 'http://192.168.0.225'; //사무실 이전으로 아이피 변경

export const DEFAULT_PRODUCT_IMAGE = `${IMAGE_BASE_URL}/zin_user1/productImg/default_product_image.png`;

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || '/zin_api',
);
export { API_BASE_URL };

export const AUTH_BASE_URL = `${API_BASE_URL}/api/user/auth`;
export const SHOPPING_API_BASE_URL = `${API_BASE_URL}/api/shopping`;

// 도메인별 '경로'만 상수로 지정
export const AUTH_PATH = '/api/user/auth';
export const SHOPPING_PATH = '/api/shopping';
export const MY_ORDER_PATH = '/api/order';
export const MY_REVIEW_PATH = '/api/review';
export const MY_INQUIRY_PATH = '/api/inquiry';
