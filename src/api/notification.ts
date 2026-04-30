import axios from './axios';
import type { AxiosResponse } from 'axios';
import type { NotificationReadResponseDto, UserNotificationResponseDto } from '@/types/api';

export const getMyNotifications = async (): Promise<AxiosResponse<UserNotificationResponseDto[]>> => {
  return await axios.get('/api/v1/notifications/me');
};

export const refreshMyNotifications = async (): Promise<AxiosResponse<UserNotificationResponseDto[]>> => {
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
