import axios from './axios';
import type { AxiosResponse } from 'axios';
import type { ErrorCodeDocItem, SystemStatusResponseDto } from '@/types/api';

export const getSystemStatus = async (): Promise<AxiosResponse<SystemStatusResponseDto>> => {
  return await axios.get('/api/v1/system/status');
};

export const getErrorCodeDocs = async (): Promise<AxiosResponse<ErrorCodeDocItem[]>> => {
  return await axios.get('/api/v1/system/error-codes');
};
