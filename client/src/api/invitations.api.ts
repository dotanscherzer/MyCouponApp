import apiClient from './apiClient';

export interface CreateInvitationData {
  email: string;
  role: 'viewer' | 'editor' | 'admin';
}

export const invitationsApi = {
  createInvitation: async (groupId: string, data: CreateInvitationData): Promise<void> => {
    await apiClient.post(`/groups/${groupId}/invitations`, data);
  },

  acceptInvitation: async (token: string): Promise<void> => {
    await apiClient.post('/invitations/accept', { token });
  },
};

