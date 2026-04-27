import axios from './axios';
import type { AxiosResponse } from 'axios';
import type { MailStatus, MailStatusResponseDto } from '@/types/api';

export const getMyMailStatus = async (): Promise<AxiosResponse<MailStatusResponseDto>> => {
  return await axios.get('/api/v1/mails/me');
};

export const changeMailStatus = async (
  status: MailStatus
): Promise<AxiosResponse<MailStatusResponseDto>> => {
  return await axios.post('/api/v1/mails', JSON.stringify(status), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
