import apiClient from './apiClient';

export interface Member {
  userId: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  role: 'viewer' | 'editor' | 'admin';
  joinedAt: string;
}

export const membersApi = {
  getMembers: async (groupId: string): Promise<Member[]> => {
    const response = await apiClient.get(`/groups/${groupId}/members`);
    return response.data;
  },

  updateMemberRole: async (
    groupId: string,
    userId: string,
    role: 'viewer' | 'editor' | 'admin'
  ): Promise<void> => {
    await apiClient.patch(`/groups/${groupId}/members/${userId}`, { role });
  },

  removeMember: async (groupId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}/members/${userId}`);
  },
};

