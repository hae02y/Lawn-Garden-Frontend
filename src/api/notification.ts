import axios from './axios';
import type { AxiosResponse } from 'axios';
import type {
  NotificationReadResponseDto,
  PageResponse,
  UserNotificationResponseDto,
  UserNotificationSettingDto,
} from '@/types/api';

interface NotificationQuery {
  unreadOnly?: boolean;
  page?: number;
  size?: number;
}

export const getMyNotifications = async ({
  unreadOnly = false,
  page = 0,
  size = 20,
}: NotificationQuery = {}): Promise<AxiosResponse<PageResponse<UserNotificationResponseDto>>> => {
  return await axios.get('/api/v1/notifications/me', {
    params: { unreadOnly, page, size },
  });
};

export const refreshMyNotifications = async (): Promise<
  AxiosResponse<PageResponse<UserNotificationResponseDto>>
> => {
  return await axios.post('/api/v1/notifications/me/refresh');
};

export const markNotificationRead = async (
  notificationId: number
): Promise<AxiosResponse<NotificationReadResponseDto>> => {
  return await axios.patch(`/api/v1/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = async (): Promise<AxiosResponse<{ updatedCount: number }>> => {
  return await axios.post('/api/v1/notifications/me/read-all');
};

export const getNotificationSettings = async (): Promise<AxiosResponse<UserNotificationSettingDto>> => {
  return await axios.get('/api/v1/notifications/me/settings');
};

export const updateNotificationSettings = async (
  payload: UserNotificationSettingDto
): Promise<AxiosResponse<UserNotificationSettingDto>> => {
  return await axios.put('/api/v1/notifications/me/settings', payload);
};
