import apiClient from '../apiClient';

export interface Store {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreData {
  name: string;
  isActive?: boolean;
}

export interface UpdateStoreData {
  name?: string;
  isActive?: boolean;
}

export const storesApi = {
  getStores: async (): Promise<Store[]> => {
    const response = await apiClient.get('/admin/stores');
    return response.data;
  },

  createStore: async (data: CreateStoreData): Promise<Store> => {
    const response = await apiClient.post('/admin/stores', data);
    return response.data;
  },

  updateStore: async (storeId: string, data: UpdateStoreData): Promise<Store> => {
    const response = await apiClient.put(`/admin/stores/${storeId}`, data);
    return response.data;
  },

  deleteStore: async (storeId: string): Promise<void> => {
    await apiClient.delete(`/admin/stores/${storeId}`);
  },
};

