import apiClient from './apiClient';

export interface StoreItem {
  id: string;
  name: string;
}

export interface MultiCouponItem {
  name: string;
  isActive: boolean;
}

export const lookupApi = {
  lookupStores: async (query: string, limit = 10): Promise<StoreItem[]> => {
    const response = await apiClient.get('/lookup/stores', {
      params: { query, limit },
    });
    return response.data.items;
  },

  lookupMultiCoupons: async (query: string, limit = 10): Promise<MultiCouponItem[]> => {
    const response = await apiClient.get('/lookup/multi-coupons', {
      params: { query, limit },
    });
    return response.data.items;
  },
};
