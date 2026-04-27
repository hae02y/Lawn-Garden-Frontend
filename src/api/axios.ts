import axios from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './config';
import { useAuthStore } from '@/store/authStore';

interface RetryAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

const Axios = axios.create({
  baseURL: API_BASE_URL,
  // withCredentials: true,
});

const isAuthRequest = (url?: string) => {
  if (!url) return false;
  return url.includes('/api/v1/auth/login') || url.includes('/api/v1/auth/refresh');
};

const requestNewAccessToken = async (): Promise<string | null> => {
  const { refreshToken, setAuthSession, clearAccessToken, userId, username } = useAuthStore.getState();
  if (!refreshToken) {
    clearAccessToken();
    return null;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
      refreshToken,
    });

    const data = response.data as {
      accessToken: string;
      refreshToken: string;
      user: { id: number | null; username: string };
    };

    const nextAccessToken = data.accessToken.replace(/^Bearer\s+/i, '').trim();
    const nextRefreshToken = data.refreshToken.replace(/^Bearer\s+/i, '').trim();

    setAuthSession({
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
      userId: data.user?.id ?? userId,
      username: data.user?.username ?? username ?? '',
    });

    return nextAccessToken;
  } catch {
    clearAccessToken();
    return null;
  }
};

// 서버 요청 직전 작업 - 인터셉터
Axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryAxiosRequestConfig | undefined;

    if (
      error?.response?.status === 401
      && originalRequest
      && !originalRequest._retry
      && !isAuthRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = requestNewAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const nextAccessToken = await refreshPromise;

      if (nextAccessToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return Axios(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default Axios;
