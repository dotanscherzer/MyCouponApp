import apiClient from './apiClient';

export interface Coupon {
  id: string;
  type: 'SINGLE' | 'MULTI';
  title: string;
  storeId?: string;
  multiCouponName?: string;
  mappingStatus?: 'MAPPED' | 'UNMAPPED';
  resolvedStoreIds?: string[];
  expiryDate: string;
  totalAmount: number;
  usedAmount: number;
  remainingAmount: number;
  currency: 'ILS' | 'USD' | 'EUR';
  status: 'ACTIVE' | 'PARTIALLY_USED' | 'USED' | 'EXPIRED' | 'CANCELLED';
  images?: Array<{
    id: string;
    url: string;
    fileName?: string;
    isPrimary: boolean;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponData {
  type: 'SINGLE' | 'MULTI';
  title: string;
  storeId?: string;
  multiCouponName?: string;
  expiryDate: string;
  totalAmount: number;
  currency?: 'ILS' | 'USD' | 'EUR';
  notes?: string;
}

export interface UpdateUsageData {
  mode: 'ADD' | 'SET';
  amount: number;
}

export const couponsApi = {
  getCoupons: async (
    groupId: string,
    params?: {
      storeId?: string;
      status?: string;
      mappingStatus?: string;
      expiringInDays?: number;
      search?: string;
      sort?: string;
      order?: 'asc' | 'desc';
    }
  ): Promise<Coupon[]> => {
    const response = await apiClient.get(`/groups/${groupId}/coupons`, { params });
    return response.data;
  },

  getCoupon: async (groupId: string, couponId: string): Promise<Coupon> => {
    const response = await apiClient.get(`/groups/${groupId}/coupons/${couponId}`);
    return response.data;
  },

  createCoupon: async (groupId: string, data: CreateCouponData): Promise<Coupon> => {
    const response = await apiClient.post(`/groups/${groupId}/coupons`, data);
    return response.data;
  },

  updateCoupon: async (
    groupId: string,
    couponId: string,
    data: Partial<CreateCouponData>
  ): Promise<Coupon> => {
    const response = await apiClient.put(`/groups/${groupId}/coupons/${couponId}`, data);
    return response.data;
  },

  deleteCoupon: async (groupId: string, couponId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}/coupons/${couponId}`);
  },

  updateUsage: async (groupId: string, couponId: string, data: UpdateUsageData): Promise<Coupon> => {
    const response = await apiClient.post(`/groups/${groupId}/coupons/${couponId}/usage`, data);
    return response.data;
  },

  cancelCoupon: async (groupId: string, couponId: string): Promise<Coupon> => {
    const response = await apiClient.post(`/groups/${groupId}/coupons/${couponId}/cancel`);
    return response.data;
  },
};
