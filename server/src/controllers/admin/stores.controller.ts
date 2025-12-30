import { Request, Response } from 'express';
import { Store } from '../../models/Store.model';

export const getStores = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stores = await Store.find().sort({ name: 1 });
    res.json(stores.map(store => ({
      id: store._id,
      name: store.name,
      isActive: store.isActive,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    })));
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Failed to get stores' });
  }
};

export const createStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, isActive } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Store name is required' });
      return;
    }

    const store = await Store.create({
      name,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      id: store._id,
      name: store.name,
      isActive: store.isActive,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Store with this name already exists' });
      return;
    }
    console.error('Create store error:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
};

export const updateStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { name, isActive } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = isActive;

    const store = await Store.findByIdAndUpdate(
      storeId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    res.json({
      id: store._id,
      name: store.name,
      isActive: store.isActive,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Store with this name already exists' });
      return;
    }
    console.error('Update store error:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
};

export const deleteStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;

    const store = await Store.findByIdAndDelete(storeId);
    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ error: 'Failed to delete store' });
  }
};
