import { useQuery, useQueries } from '@tanstack/react-query';
import { groupsApi, type Group } from '../api/groups.api';
import { couponsApi, type Coupon } from '../api/coupons.api';

export interface CouponWithGroup extends Coupon {
  groupId: string;
  groupName: string;
}

export const useAllCoupons = (
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
  // Load all groups
  const { data: groups, isLoading: groupsLoading } = useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getGroups(),
  });

  // Load coupons for all groups in parallel
  const couponQueries = useQueries({
    queries:
      groups?.map((group) => ({
        queryKey: ['coupons', group.id, filters],
        queryFn: () => couponsApi.getCoupons(group.id, filters),
        enabled: !!groups && groups.length > 0,
      })) || [],
  });

  // Combine results
  const allCoupons: CouponWithGroup[] = [];
  let isLoading = groupsLoading;
  let hasError = false;

  couponQueries.forEach((query, index) => {
    if (query.isLoading) {
      isLoading = true;
    }
    if (query.error) {
      hasError = true;
    }
    if (query.data && groups?.[index]) {
      const group = groups[index];
      const couponsWithGroup = query.data.map((coupon) => ({
        ...coupon,
        groupId: group.id,
        groupName: group.name,
      }));
      allCoupons.push(...couponsWithGroup);
    }
  });

  // Sort if sort parameter is provided
  let sortedCoupons = allCoupons;
  if (filters?.sort) {
    sortedCoupons = [...allCoupons].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sort) {
        case 'expiryDate':
          aValue = new Date(a.expiryDate).getTime();
          bValue = new Date(b.expiryDate).getTime();
          break;
        case 'remainingAmount':
          aValue = a.remainingAmount;
          bValue = b.remainingAmount;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = new Date(a.expiryDate).getTime();
          bValue = new Date(b.expiryDate).getTime();
      }

      const order = filters.order === 'desc' ? -1 : 1;
      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
      return 0;
    });
  }

  return {
    data: sortedCoupons,
    isLoading,
    error: hasError ? new Error('Failed to load some coupons') : null,
  };
};

