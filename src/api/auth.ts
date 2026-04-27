import axios from './axios';
import type { AxiosResponse } from 'axios';
import { API_BASE_URL } from './config';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  SignUpRequest,
  UserDetailResponseDto,
} from '@/types/api';

export const normalizeBearerToken = (value: string) =>
  value.replace(/^Bearer\s+/i, '').trim();

export const signUp = async (
  { email, githubId, password }: SignUpRequest
): Promise<AxiosResponse<UserDetailResponseDto>> => {
  return await axios.post('/api/v1/users/register', {
    username: githubId,
    password,
    email,
  });
};

export const login = async (
  { username, password }: LoginRequest
): Promise<AxiosResponse<LoginResponse>> => {
  return await axios.post('/api/v1/auth/login', {
    username,
    password,
  });
};

export const logout = async (): Promise<AxiosResponse<void>> => {
  return await axios.post('/api/v1/auth/logout');
};

export const refresh = async (
  request: RefreshTokenRequest
): Promise<AxiosResponse<LoginResponse>> => {
  return await axios.post('/api/v1/auth/refresh', request);
};

export const getGithubOAuthStartUrl = () => {
  return `${API_BASE_URL}/api/v1/oauth2/login/authorize`;
};
