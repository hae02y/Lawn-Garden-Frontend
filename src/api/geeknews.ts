import axios from './axios';
import type { AxiosResponse } from 'axios';
import type { GeekNewsListResponseDto, GeekNewsStateResponseDto } from '@/types/api';

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

export const getMyBookmarkedGeekNews = async ({
  page = 0,
  size = 20,
}: Omit<GetGeekNewsParams, 'keyword'> = {}): Promise<AxiosResponse<GeekNewsListResponseDto>> => {
  return await axios.get('/api/v1/geeknews/bookmarks/me', {
    params: { page, size },
  });
};

export const toggleGeekNewsBookmark = async (
  articleId: number,
  bookmarked: boolean
): Promise<AxiosResponse<GeekNewsStateResponseDto>> => {
  return await axios.post(`/api/v1/geeknews/${articleId}/bookmark`, null, {
    params: { bookmarked },
  });
};

export const markGeekNewsRead = async (
  articleId: number
): Promise<AxiosResponse<GeekNewsStateResponseDto>> => {
  return await axios.post(`/api/v1/geeknews/${articleId}/read`);
};
