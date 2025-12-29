import { Request, Response } from 'express';
import { Store } from '../models/Store.model';
import { MultiCouponDefinition } from '../models/MultiCouponDefinition.model';

export const lookupStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, limit = '10' } = req.query;
    const limitNum = parseInt(limit as string, 10);

    if (!query || typeof query !== 'string') {
      res.json({ items: [] });
      return;
    }

    // Text search with regex (prioritize "starts with")
    const regex = new RegExp(`^${query}`, 'i');
    const stores = await Store.find({
      isActive: true,
      name: { $regex: regex },
    })
      .limit(limitNum)
      .sort({ name: 1 });

    res.json({
      items: stores.map(store => ({
        id: store._id,
        name: store.name,
      })),
    });
  } catch (error) {
    console.error('Lookup stores error:', error);
    res.status(500).json({ error: 'Failed to lookup stores' });
  }
};

export const lookupMultiCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, limit = '10' } = req.query;
    const limitNum = parseInt(limit as string, 10);

    if (!query || typeof query !== 'string') {
      res.json({ items: [] });
      return;
    }

    // Text search with regex (prioritize "starts with")
    const regex = new RegExp(`^${query}`, 'i');
    const definitions = await MultiCouponDefinition.find({
      isActive: true,
      name: { $regex: regex },
    })
      .limit(limitNum)
      .sort({ name: 1 });

    res.json({
      items: definitions.map(def => ({
        name: def.name,
        isActive: def.isActive,
      })),
    });
  } catch (error) {
    console.error('Lookup multi-coupons error:', error);
    res.status(500).json({ error: 'Failed to lookup multi-coupons' });
  }
};
