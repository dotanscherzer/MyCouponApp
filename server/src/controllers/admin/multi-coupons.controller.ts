import { Request, Response } from 'express';
import { MultiCouponDefinition } from '../../models/MultiCouponDefinition.model';
import { resolveUnmappedCoupons } from '../../services/multi-coupon.service';
import { Types } from 'mongoose';

export const getMultiCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const definitions = await MultiCouponDefinition.find().sort({ name: 1 }).populate('storeIds');
    res.json(definitions.map(def => ({
      id: def._id,
      name: def.name,
      storeIds: def.storeIds,
      isActive: def.isActive,
      createdAt: def.createdAt,
      updatedAt: def.updatedAt,
    })));
  } catch (error) {
    console.error('Get multi-coupons error:', error);
    res.status(500).json({ error: 'Failed to get multi-coupon definitions' });
  }
};

export const createMultiCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, storeIds, isActive } = req.body;

    if (!name || !Array.isArray(storeIds)) {
      res.status(400).json({ error: 'Name and storeIds array are required' });
      return;
    }

    const definition = await MultiCouponDefinition.create({
      name,
      storeIds: storeIds.map((id: string) => new Types.ObjectId(id)),
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      id: definition._id,
      name: definition.name,
      storeIds: definition.storeIds,
      isActive: definition.isActive,
      createdAt: definition.createdAt,
      updatedAt: definition.updatedAt,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Multi-coupon definition with this name already exists' });
      return;
    }
    console.error('Create multi-coupon error:', error);
    res.status(500).json({ error: 'Failed to create multi-coupon definition' });
  }
};

export const updateMultiCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, storeIds, isActive } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (storeIds !== undefined) {
      updateData.storeIds = storeIds.map((id: string) => new Types.ObjectId(id));
    }
    if (isActive !== undefined) updateData.isActive = isActive;

    const definition = await MultiCouponDefinition.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('storeIds');

    if (!definition) {
      res.status(404).json({ error: 'Multi-coupon definition not found' });
      return;
    }

    res.json({
      id: definition._id,
      name: definition.name,
      storeIds: definition.storeIds,
      isActive: definition.isActive,
      createdAt: definition.createdAt,
      updatedAt: definition.updatedAt,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Multi-coupon definition with this name already exists' });
      return;
    }
    console.error('Update multi-coupon error:', error);
    res.status(500).json({ error: 'Failed to update multi-coupon definition' });
  }
};

export const deleteMultiCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const definition = await MultiCouponDefinition.findByIdAndDelete(id);
    if (!definition) {
      res.status(404).json({ error: 'Multi-coupon definition not found' });
      return;
    }

    res.json({ message: 'Multi-coupon definition deleted successfully' });
  } catch (error) {
    console.error('Delete multi-coupon error:', error);
    res.status(500).json({ error: 'Failed to delete multi-coupon definition' });
  }
};

export const resolveUnmapped = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const resolvedCount = await resolveUnmappedCoupons(id);

    res.json({
      message: `Resolved ${resolvedCount} unmapped coupons`,
      resolvedCount,
    });
  } catch (error: any) {
    console.error('Resolve unmapped error:', error);
    res.status(500).json({ error: error.message || 'Failed to resolve unmapped coupons' });
  }
};
