import axios from './axios';
import type { AxiosResponse } from 'axios';
import type { PageResponse, PostDetailDto, PostSummaryDto } from '@/types/api';

interface GetPostsParams {
  page?: number;
  size?: number;
  keyword?: string;
}

export const getPosts = async ({
  page = 0,
  size = 5,
  keyword,
}: GetPostsParams = {}): Promise<AxiosResponse<PageResponse<PostSummaryDto>>> => {
  return await axios.get('/api/v1/posts', {
    params: { page, size, keyword },
  });
};

export const getPostById = async (
  postId: number | string
): Promise<AxiosResponse<PostDetailDto>> => {
  return await axios.get(`/api/v1/posts/${postId}`);
};

export const createPost = async (
  formData: FormData
): Promise<AxiosResponse<void>> => {
  return await axios.post('/api/v1/posts', formData);
};

export const updatePost = async (
  postId: number | string,
  formData: FormData
): Promise<AxiosResponse<PostDetailDto>> => {
  return await axios.patch(`/api/v1/posts/${postId}`, formData);
};

export const deletePost = async (postId: number | string): Promise<AxiosResponse<void>> => {
  return await axios.delete(`/api/v1/posts/${postId}`);
};
