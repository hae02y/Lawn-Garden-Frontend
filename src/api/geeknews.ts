import axios from './axios';
import type { AxiosResponse } from 'axios';
import type { GeekNewsListResponseDto } from '@/types/api';

interface GetGeekNewsParams {
  page?: number;
  size?: number;
  keyword?: string;
}

export const getGeekNews = async ({
  page = 0,
  size = 20,
  keyword,
}: GetGeekNewsParams = {}): Promise<AxiosResponse<GeekNewsListResponseDto>> => {
  return await axios.get('/api/v1/geeknews', {
    params: {
      page,
      size,
      keyword,
    },
  });
};
