import apiClient from '../apiClient';

export interface UnmappedEvent {
  id: string;
  multiCouponName: string;
  couponId: any;
  groupId: any;
  createdByUserId: any;
  status: 'open' | 'handled' | 'ignored';
  adminNotifiedAt?: string;
  handledAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUnmappedEventData {
  status?: 'open' | 'handled' | 'ignored';
  notes?: string;
}

export const unmappedEventsApi = {
  getUnmappedEvents: async (status?: string): Promise<UnmappedEvent[]> => {
    const response = await apiClient.get('/admin/unmapped-multi-events', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  updateUnmappedEvent: async (
    id: string,
    data: UpdateUnmappedEventData
  ): Promise<UnmappedEvent> => {
    const response = await apiClient.patch(`/admin/unmapped-multi-events/${id}`, data);
    return response.data;
  },
};

