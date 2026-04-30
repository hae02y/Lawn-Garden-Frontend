import axios from './axios';
import type { AxiosResponse } from 'axios';
import type {
  CheerStatusResponseDto,
  CheerType,
  WeeklyLeaderboardItemDto,
} from '@/types/api';

export const cheerUser = async (
  targetUserId: number,
  type: CheerType
): Promise<AxiosResponse<CheerStatusResponseDto>> => {
  return await axios.post(`/api/v1/social/cheer/${targetUserId}`, { type });
};

export const getCheerStatus = async (
  targetUserId: number
): Promise<AxiosResponse<CheerStatusResponseDto>> => {
  return await axios.get(`/api/v1/social/cheer/${targetUserId}/status`);
};

export const getWeeklyLeaderboard = async (
  limit = 10
): Promise<AxiosResponse<WeeklyLeaderboardItemDto[]>> => {
  return await axios.get('/api/v1/social/leaderboard/weekly', {
    params: { limit },
  });
};
