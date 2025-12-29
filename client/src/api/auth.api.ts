import apiClient from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    appRole: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  getGoogleAuthUrl: async (): Promise<{ authUrl: string }> => {
    const response = await apiClient.get('/auth/google/start');
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout', { refreshToken });
  },
};
