import { Request, Response } from 'express';
import {
  createCoupon,
  listCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  updateCouponUsage,
  calculateStatus,
  ListCouponsFilters,
} from '../services/coupons.service';
import { resolveMultiCoupon, handleUnmappedCoupon } from '../services/multi-coupon.service';
import { Coupon } from '../models/Coupon.model';

export const createCouponController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { type, title, storeId, multiCouponName, expiryDate, totalAmount, currency, notes } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!type || !title || !expiryDate || totalAmount === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    let mappingStatus: 'MAPPED' | 'UNMAPPED' = 'MAPPED';
    let resolvedStoreIds: string[] = [];

    // Handle MULTI coupon mapping
    if (type === 'MULTI') {
      if (!multiCouponName) {
        res.status(400).json({ error: 'multiCouponName is required for MULTI coupons' });
        return;
      }

      const mapping = await resolveMultiCoupon(multiCouponName);
      if (mapping) {
        mappingStatus = mapping.mappingStatus;
        resolvedStoreIds = mapping.resolvedStoreIds;
      }
    } else if (type === 'SINGLE') {
      if (!storeId) {
        res.status(400).json({ error: 'storeId is required for SINGLE coupons' });
        return;
      }
    } else {
      res.status(400).json({ error: 'Invalid coupon type' });
      return;
    }

    // Create coupon
    const coupon = await createCoupon({
      groupId,
      createdByUserId: req.user.userId,
      type,
      title,
      storeId,
      multiCouponName,
      expiryDate: new Date(expiryDate),
      totalAmount,
      currency,
      notes,
      mappingStatus,
      resolvedStoreIds,
    });

    // Handle unmapped MULTI coupon
    if (type === 'MULTI' && mappingStatus === 'UNMAPPED') {
      await handleUnmappedCoupon(coupon._id.toString(), groupId, req.user.userId, multiCouponName!);
    }

    res.status(201).json({
      id: coupon._id,
      type: coupon.type,
      title: coupon.title,
      storeId: coupon.storeId,
      multiCouponName: coupon.multiCouponName,
      mappingStatus: coupon.mappingStatus,
      resolvedStoreIds: coupon.resolvedStoreIds,
      expiryDate: coupon.expiryDate,
      totalAmount: coupon.totalAmount,
      usedAmount: coupon.usedAmount,
      remainingAmount: coupon.remainingAmount,
      currency: coupon.currency,
      status: coupon.status,
      notes: coupon.notes,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    res.status(500).json({ error: error.message || 'Failed to create coupon' });
  }
};

export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { storeId, status, mappingStatus, expiringInDays, search, sort, order } = req.query;

    const filters: ListCouponsFilters = {
      groupId,
      storeId: storeId as string,
      status: status as any,
      mappingStatus: mappingStatus as any,
      expiringInDays: expiringInDays ? parseInt(expiringInDays as string) : undefined,
      search: search as string,
      sort: (sort as any) || 'expiryDate',
      order: (order as 'asc' | 'desc') || 'asc',
    };

    const coupons = await listCoupons(filters);

    res.json(coupons.map(coupon => ({
      id: coupon._id,
      type: coupon.type,
      title: coupon.title,
      storeId: coupon.storeId,
      multiCouponName: coupon.multiCouponName,
      mappingStatus: coupon.mappingStatus,
      resolvedStoreIds: coupon.resolvedStoreIds,
      expiryDate: coupon.expiryDate,
      totalAmount: coupon.totalAmount,
      usedAmount: coupon.usedAmount,
      remainingAmount: coupon.remainingAmount,
      currency: coupon.currency,
      status: coupon.status,
      images: coupon.images,
      notes: coupon.notes,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    })));
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ error: 'Failed to get coupons' });
  }
};

export const getCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, couponId } = req.params;

    const coupon = await getCouponById(couponId, groupId);
    if (!coupon) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }

    res.json({
      id: coupon._id,
      type: coupon.type,
      title: coupon.title,
      storeId: coupon.storeId,
      multiCouponName: coupon.multiCouponName,
      mappingStatus: coupon.mappingStatus,
      resolvedStoreIds: coupon.resolvedStoreIds,
      expiryDate: coupon.expiryDate,
      totalAmount: coupon.totalAmount,
      usedAmount: coupon.usedAmount,
      remainingAmount: coupon.remainingAmount,
      currency: coupon.currency,
      status: coupon.status,
      images: coupon.images,
      notes: coupon.notes,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    });
  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({ error: 'Failed to get coupon' });
  }
};

export const updateCouponController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, couponId } = req.params;
    const updateData: any = {};

    const allowedFields = ['title', 'expiryDate', 'totalAmount', 'currency', 'notes'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Handle expiryDate conversion
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }

    // Recalculate status if needed
    if (updateData.expiryDate || updateData.totalAmount !== undefined) {
      const coupon = await getCouponById(couponId, groupId);
      if (coupon) {
        const expiryDate = updateData.expiryDate || coupon.expiryDate;
        const totalAmount = updateData.totalAmount !== undefined ? updateData.totalAmount : coupon.totalAmount;
        updateData.status = calculateStatus(coupon.usedAmount, totalAmount, expiryDate, coupon.status);
        
        if (updateData.totalAmount !== undefined) {
          updateData.remainingAmount = totalAmount - coupon.usedAmount;
        }
      }
    }

    const coupon = await updateCoupon(couponId, groupId, updateData);
    if (!coupon) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }

    res.json({
      id: coupon._id,
      type: coupon.type,
      title: coupon.title,
      storeId: coupon.storeId,
      multiCouponName: coupon.multiCouponName,
      mappingStatus: coupon.mappingStatus,
      resolvedStoreIds: coupon.resolvedStoreIds,
      expiryDate: coupon.expiryDate,
      totalAmount: coupon.totalAmount,
      usedAmount: coupon.usedAmount,
      remainingAmount: coupon.remainingAmount,
      currency: coupon.currency,
      status: coupon.status,
      images: coupon.images,
      notes: coupon.notes,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
};

export const deleteCouponController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, couponId } = req.params;

    const deleted = await deleteCoupon(couponId, groupId);
    if (!deleted) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
};

export const updateUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, couponId } = req.params;
    const { mode, amount } = req.body;

    if (!mode || !['ADD', 'SET'].includes(mode)) {
      res.status(400).json({ error: 'Valid mode (ADD or SET) is required' });
      return;
    }

    if (amount === undefined || amount < 0) {
      res.status(400).json({ error: 'Valid amount is required' });
      return;
    }

    try {
      const coupon = await updateCouponUsage(couponId, groupId, mode, amount);

      res.json({
        id: coupon._id,
        usedAmount: coupon.usedAmount,
        remainingAmount: coupon.remainingAmount,
        status: coupon.status,
      });
    } catch (error: any) {
      if (error.message.includes('cannot exceed') || error.message.includes('Concurrent')) {
        res.status(409).json({ error: error.message });
        return;
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Update usage error:', error);
    res.status(500).json({ error: error.message || 'Failed to update coupon usage' });
  }
};

export const cancelCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, couponId } = req.params;

    const coupon = await updateCoupon(couponId, groupId, { status: 'CANCELLED' });
    if (!coupon) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }

    res.json({
      id: coupon._id,
      status: coupon.status,
    });
  } catch (error) {
    console.error('Cancel coupon error:', error);
    res.status(500).json({ error: 'Failed to cancel coupon' });
  }
};
