import axios from './axios';
import type { AxiosResponse } from 'axios';
import type { UserAchievementResponseDto } from '@/types/api';

export const getMyAchievements = async (): Promise<AxiosResponse<UserAchievementResponseDto[]>> => {
  return await axios.get('/api/v1/achievements/me');
};

export const refreshMyAchievements = async (): Promise<AxiosResponse<UserAchievementResponseDto[]>> => {
  return await axios.post('/api/v1/achievements/me/refresh');
};
