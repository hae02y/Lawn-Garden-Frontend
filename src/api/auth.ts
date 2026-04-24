import axios from './axios';
import type { AxiosResponse } from 'axios';
import type { LoginRequest, LoginResponse, SignUpRequest, UserDetailResponseDto } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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

export const getGithubOAuthStartUrl = () => {
  return `${API_BASE_URL}/api/v1/oauth2/login/authorize`;
};
