import axios from './axios';
import type { AxiosResponse } from 'axios';
import type { UserDetailResponseDto } from '@/types/api';

export const getAllUsers = async (): Promise<AxiosResponse<UserDetailResponseDto[]>> => {
  return await axios.get('/api/v1/users');
};

export const getUserById = async (
  userId: number | string
): Promise<AxiosResponse<UserDetailResponseDto>> => {
  return await axios.get(`/api/v1/users/${userId}`);
};

export const getMyUser = async (): Promise<AxiosResponse<UserDetailResponseDto>> => {
  return await axios.get('/api/v1/users/me');
};

export const getTodayUsers = async (
  commit: 'y' | 'n' | 'a'
): Promise<AxiosResponse<UserDetailResponseDto[]>> => {
  return await axios.get('/api/v1/users/today', {
    params: { commit },
  });
};
