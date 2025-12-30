import apiClient from '../apiClient';

export interface MultiCouponDefinition {
  id: string;
  name: string;
  storeIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMultiCouponData {
  name: string;
  storeIds: string[];
  isActive?: boolean;
}

export interface UpdateMultiCouponData {
  name?: string;
  storeIds?: string[];
  isActive?: boolean;
}

export interface ResolveUnmappedResponse {
  message: string;
  resolvedCount: number;
}

export const multiCouponsApi = {
  getMultiCoupons: async (): Promise<MultiCouponDefinition[]> => {
    const response = await apiClient.get('/admin/multi-coupons');
    return response.data;
  },

  createMultiCoupon: async (data: CreateMultiCouponData): Promise<MultiCouponDefinition> => {
    const response = await apiClient.post('/admin/multi-coupons', data);
    return response.data;
  },

  updateMultiCoupon: async (
    id: string,
    data: UpdateMultiCouponData
  ): Promise<MultiCouponDefinition> => {
    const response = await apiClient.put(`/admin/multi-coupons/${id}`, data);
    return response.data;
  },

  deleteMultiCoupon: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/multi-coupons/${id}`);
  },

  resolveUnmapped: async (id: string): Promise<ResolveUnmappedResponse> => {
    const response = await apiClient.post(`/admin/multi-coupons/${id}/resolve-unmapped`);
    return response.data;
  },
};

