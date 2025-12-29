import apiClient from './apiClient';

export interface Group {
  id: string;
  name: string;
  ownerUserId: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export const groupsApi = {
  getGroups: async (): Promise<Group[]> => {
    const response = await apiClient.get('/groups');
    return response.data;
  },

  getGroup: async (groupId: string): Promise<Group> => {
    const response = await apiClient.get(`/groups/${groupId}`);
    return response.data;
  },

  createGroup: async (data: { name: string }): Promise<Group> => {
    const response = await apiClient.post('/groups', data);
    return response.data;
  },

  updateGroup: async (groupId: string, data: { name: string }): Promise<Group> => {
    const response = await apiClient.put(`/groups/${groupId}`, data);
    return response.data;
  },

  deleteGroup: async (groupId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}`);
  },
};
