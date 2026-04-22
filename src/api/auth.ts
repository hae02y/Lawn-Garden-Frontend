import axios from './axios';
import type { AxiosResponse } from 'axios';

// 회원가입 요청 파라미터 타입
interface SignUpPayload {
  email: string;
  githubId: string;
  password: string;
}

// 로그인 요청 파라미터 타입
interface LoginPayload {
  username: string;
  password: string;
}

// 서버 응답 타입
// 임시로 했는데 맞게 변경
interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id?: number;
    username?: string;
    email?: string;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 회원가입 API
export const signUp = async (
  { email, githubId, password }: SignUpPayload
): Promise<AxiosResponse<AuthResponse>> => {
  return await axios.post('/api/v1/users/register', {
    username: githubId, // 서버에 맞게 username을 githubId로 전달
    password,
    email,
  });
};

// 로그인 API
export const login = async (
  { username, password }: LoginPayload
): Promise<AxiosResponse<AuthResponse>> => {
  return await axios.post('/api/v1/auth/login', {
    username,
    password,
  });
};

export const getGithubOAuthUrl = (redirectUri: string) => {
  const url = new URL('/oauth2/authorization/github', API_BASE_URL);
  url.searchParams.set('redirect_uri', redirectUri);
  return url.toString();
};
