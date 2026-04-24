import axios from './axios';
import type { AxiosResponse } from 'axios';
import type { UserStatsResponseDto } from '@/types/api';

export const getWeeklyStats = async (): Promise<AxiosResponse<UserStatsResponseDto[]>> => {
  return await axios.get('/api/v1/stats/weekly');
};

export const getTodayStats = async (): Promise<AxiosResponse<UserStatsResponseDto[]>> => {
  return await axios.get('/api/v1/stats/today');
};
