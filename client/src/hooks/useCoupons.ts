import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsApi, Coupon, CreateCouponData, UpdateUsageData } from '../api/coupons.api';

export const useCoupons = (
  groupId: string,
  filters?: {
    storeId?: string;
    status?: string;
    mappingStatus?: string;
    expiringInDays?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }
) => {
  return useQuery<Coupon[]>({
    queryKey: ['coupons', groupId, filters],
    queryFn: () => couponsApi.getCoupons(groupId, filters),
    enabled: !!groupId,
  });
};

export const useCoupon = (groupId: string, couponId: string) => {
  return useQuery<Coupon>({
    queryKey: ['coupon', groupId, couponId],
    queryFn: () => couponsApi.getCoupon(groupId, couponId),
    enabled: !!groupId && !!couponId,
  });
};

export const useCreateCoupon = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCouponData) => couponsApi.createCoupon(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', groupId] });
    },
  });
};

export const useUpdateCoupon = (groupId: string, couponId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateCouponData>) => couponsApi.updateCoupon(groupId, couponId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', groupId] });
      queryClient.invalidateQueries({ queryKey: ['coupon', groupId, couponId] });
    },
  });
};

export const useDeleteCoupon = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId: string) => couponsApi.deleteCoupon(groupId, couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', groupId] });
    },
  });
};

export const useUpdateCouponUsage = (groupId: string, couponId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUsageData) => couponsApi.updateUsage(groupId, couponId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', groupId] });
      queryClient.invalidateQueries({ queryKey: ['coupon', groupId, couponId] });
    },
  });
};

export const useCancelCoupon = (groupId: string, couponId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => couponsApi.cancelCoupon(groupId, couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', groupId] });
      queryClient.invalidateQueries({ queryKey: ['coupon', groupId, couponId] });
    },
  });
};

