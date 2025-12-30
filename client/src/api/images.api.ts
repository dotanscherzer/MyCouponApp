import apiClient from './apiClient';

export interface InitUploadResponse {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export interface AssociateImageData {
  url: string;
  fileName?: string;
  mimeType?: string;
  isPrimary?: boolean;
}

export interface Image {
  id: string;
  url: string;
  fileName?: string;
  mimeType?: string;
  isPrimary: boolean;
  createdAt: string;
}

export const imagesApi = {
  initUpload: async (groupId: string, couponId: string): Promise<InitUploadResponse> => {
    const response = await apiClient.post(`/groups/${groupId}/coupons/${couponId}/images/init-upload`);
    return response.data;
  },

  associateImage: async (
    groupId: string,
    couponId: string,
    data: AssociateImageData
  ): Promise<Image> => {
    const response = await apiClient.post(`/groups/${groupId}/coupons/${couponId}/images`, data);
    return response.data;
  },

  deleteImage: async (groupId: string, couponId: string, imageId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}/coupons/${couponId}/images/${imageId}`);
  },
};

