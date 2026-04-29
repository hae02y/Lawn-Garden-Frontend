import axios from './axios';
import type { AxiosResponse } from 'axios';
import type {
  AdminSyncResponseDto,
  GeekNewsSyncLogResponseDto,
  PageResponse,
} from '@/types/api';

export const syncGeekNewsByAdmin = async (
  limit: number
): Promise<AxiosResponse<AdminSyncResponseDto>> => {
  return await axios.post('/api/v1/admin/geeknews/sync', null, {
    params: { limit },
  });
};

export const syncAllUserLevelsByAdmin = async (): Promise<AxiosResponse<AdminSyncResponseDto>> => {
  return await axios.post('/api/v1/admin/users/levels/sync');
};

export const getGeekNewsSyncLogsByAdmin = async (
  page = 0,
  size = 20
): Promise<AxiosResponse<PageResponse<GeekNewsSyncLogResponseDto>>> => {
  return await axios.get('/api/v1/admin/geeknews/sync-logs', {
    params: { page, size },
  });
};
