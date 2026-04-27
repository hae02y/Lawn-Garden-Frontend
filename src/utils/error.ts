import axios from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | string | undefined;
    if (typeof data === 'string') return data;
    return data?.message || data?.error || fallbackMessage;
  }

  if (error instanceof Error) return error.message;

  return fallbackMessage;
};
