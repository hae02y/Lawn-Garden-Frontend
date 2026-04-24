import axios from './axios';
import type { AxiosResponse } from 'axios';
import type { MailStatus } from '@/types/api';

export const changeMailStatus = async (
  status: MailStatus
): Promise<AxiosResponse<void>> => {
  return await axios.post('/api/v1/mails', JSON.stringify(status), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
