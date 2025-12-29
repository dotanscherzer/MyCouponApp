import { Coupon, ICoupon } from '../models/Coupon.model';
import { Types } from 'mongoose';

export type CouponStatus = 'ACTIVE' | 'PARTIALLY_USED' | 'USED' | 'EXPIRED' | 'CANCELLED';
export type CouponType = 'SINGLE' | 'MULTI';

export interface CreateCouponData {
  groupId: string;
  createdByUserId: string;
  type: CouponType;
  title: string;
  storeId?: string;
  multiCouponName?: string;
  expiryDate: Date;
  totalAmount: number;
  currency?: 'ILS' | 'USD' | 'EUR';
  notes?: string;
  mappingStatus?: 'MAPPED' | 'UNMAPPED';
  resolvedStoreIds?: string[];
}

export function calculateStatus(usedAmount: number, totalAmount: number, expiryDate: Date, currentStatus?: CouponStatus): CouponStatus {
  // If already USED or CANCELLED, don't change
  if (currentStatus === 'USED' || currentStatus === 'CANCELLED') {
    return currentStatus;
  }

  // Check expiry
  const now = new Date();
  if (expiryDate < now) {
    return 'EXPIRED';
  }

  // Calculate based on usage
  if (usedAmount === 0) {
    return 'ACTIVE';
  } else if (usedAmount >= totalAmount) {
    return 'USED';
  } else {
    return 'PARTIALLY_USED';
  }
}

export async function createCoupon(data: CreateCouponData): Promise<ICoupon> {
  const remainingAmount = data.totalAmount;
  const status = calculateStatus(0, data.totalAmount, data.expiryDate);

  const couponData: any = {
    groupId: new Types.ObjectId(data.groupId),
    createdByUserId: new Types.ObjectId(data.createdByUserId),
    type: data.type,
    title: data.title,
    expiryDate: data.expiryDate,
    totalAmount: data.totalAmount,
    usedAmount: 0,
    remainingAmount,
    currency: data.currency || 'ILS',
    status,
    notes: data.notes,
  };

  if (data.type === 'SINGLE') {
    couponData.storeId = new Types.ObjectId(data.storeId);
  } else {
    couponData.multiCouponName = data.multiCouponName;
    couponData.mappingStatus = data.mappingStatus || 'MAPPED';
    couponData.resolvedStoreIds = (data.resolvedStoreIds || []).map(id => new Types.ObjectId(id));
  }

  const coupon = await Coupon.create(couponData);
  return coupon;
}

export interface ListCouponsFilters {
  groupId: string;
  storeId?: string;
  status?: CouponStatus;
  mappingStatus?: 'MAPPED' | 'UNMAPPED';
  expiringInDays?: number;
  search?: string;
  sort?: 'expiryDate' | 'remainingAmount' | 'createdAt';
  order?: 'asc' | 'desc';
}

export async function listCoupons(filters: ListCouponsFilters) {
  const query: any = {
    groupId: new Types.ObjectId(filters.groupId),
  };

  // Store filter: SINGLE coupons with storeId OR MULTI coupons with storeId in resolvedStoreIds
  if (filters.storeId) {
    query.$or = [
      { type: 'SINGLE', storeId: new Types.ObjectId(filters.storeId) },
      { type: 'MULTI', resolvedStoreIds: new Types.ObjectId(filters.storeId), mappingStatus: 'MAPPED' },
    ];
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.mappingStatus) {
    query.mappingStatus = filters.mappingStatus;
  }

  if (filters.expiringInDays) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + filters.expiringInDays);
    query.expiryDate = { $lte: futureDate, $gte: new Date() };
  }

  if (filters.search) {
    const searchConditions = [
      { title: { $regex: filters.search, $options: 'i' } },
      { multiCouponName: { $regex: filters.search, $options: 'i' } },
    ];
    
    if (query.$or) {
      query.$and = [
        { $or: query.$or },
        { $or: searchConditions },
      ];
      delete query.$or;
    } else {
      query.$or = searchConditions;
    }
  }

  const sortOptions: any = {};
  const sortField = filters.sort || 'expiryDate';
  const sortOrder = filters.order === 'desc' ? -1 : 1;
  sortOptions[sortField] = sortOrder;

  const coupons = await Coupon.find(query).sort(sortOptions);
  return coupons;
}

export async function getCouponById(couponId: string, groupId: string): Promise<ICoupon | null> {
  const coupon = await Coupon.findOne({
    _id: new Types.ObjectId(couponId),
    groupId: new Types.ObjectId(groupId),
  });
  return coupon;
}

export async function updateCoupon(couponId: string, groupId: string, updateData: any): Promise<ICoupon | null> {
  const coupon = await Coupon.findOneAndUpdate(
    {
      _id: new Types.ObjectId(couponId),
      groupId: new Types.ObjectId(groupId),
    },
    updateData,
    { new: true, runValidators: true }
  );
  return coupon;
}

export async function deleteCoupon(couponId: string, groupId: string): Promise<boolean> {
  const result = await Coupon.deleteOne({
    _id: new Types.ObjectId(couponId),
    groupId: new Types.ObjectId(groupId),
  });
  return result.deletedCount > 0;
}

export async function updateCouponUsage(
  couponId: string,
  groupId: string,
  mode: 'ADD' | 'SET',
  amount: number
): Promise<ICoupon | null> {
  const coupon = await Coupon.findOne({
    _id: new Types.ObjectId(couponId),
    groupId: new Types.ObjectId(groupId),
  });

  if (!coupon) {
    throw new Error('Coupon not found');
  }

  let newUsedAmount: number;
  if (mode === 'ADD') {
    newUsedAmount = coupon.usedAmount + amount;
  } else {
    newUsedAmount = amount;
  }

  // Validate: usedAmount <= totalAmount
  if (newUsedAmount > coupon.totalAmount) {
    throw new Error('Used amount cannot exceed total amount');
  }

  if (newUsedAmount < 0) {
    throw new Error('Used amount cannot be negative');
  }

  // Atomic update with condition
  const newRemainingAmount = coupon.totalAmount - newUsedAmount;
  const newStatus = calculateStatus(newUsedAmount, coupon.totalAmount, coupon.expiryDate, coupon.status);

  const updatedCoupon = await Coupon.findOneAndUpdate(
    {
      _id: new Types.ObjectId(couponId),
      groupId: new Types.ObjectId(groupId),
      usedAmount: coupon.usedAmount, // Ensure no concurrent modifications
    },
    {
      usedAmount: newUsedAmount,
      remainingAmount: newRemainingAmount,
      status: newStatus,
    },
    { new: true }
  );

  if (!updatedCoupon) {
    throw new Error('Failed to update coupon. Concurrent modification detected.');
  }

  return updatedCoupon;
}
