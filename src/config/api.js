const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || '/zin_api'
);

export const AUTH_BASE_URL = `${API_BASE_URL}/api/user/auth`;
export const SHOPPING_API_BASE_URL = `${API_BASE_URL}/api/shopping`;

export { API_BASE_URL };
