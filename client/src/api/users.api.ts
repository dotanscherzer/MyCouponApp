import apiClient from './apiClient';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  appRole: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  daysBefore: number[];
  timezone: string;
  emailDigest: boolean;
}

export const usersApi = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/me');
    return response.data;
  },

  updateMe: async (data: { displayName?: string; photoUrl?: string }): Promise<User> => {
    const response = await apiClient.put('/me', data);
    return response.data;
  },

  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get('/me/notifications');
    return response.data;
  },

  updateNotificationPreferences: async (data: NotificationPreferences): Promise<NotificationPreferences> => {
    const response = await apiClient.put('/me/notifications', data);
    return response.data;
  },
};
