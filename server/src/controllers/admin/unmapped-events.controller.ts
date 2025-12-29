import { Request, Response } from 'express';
import { UnmappedMultiCouponEvent } from '../../models/UnmappedMultiCouponEvent.model';

export const getUnmappedEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const events = await UnmappedMultiCouponEvent.find(query)
      .sort({ createdAt: -1 })
      .populate('couponId', 'title multiCouponName')
      .populate('groupId', 'name')
      .populate('createdByUserId', 'email displayName');

    res.json(events.map(event => ({
      id: event._id,
      multiCouponName: event.multiCouponName,
      couponId: event.couponId,
      groupId: event.groupId,
      createdByUserId: event.createdByUserId,
      status: event.status,
      adminNotifiedAt: event.adminNotifiedAt,
      handledAt: event.handledAt,
      notes: event.notes,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    })));
  } catch (error) {
    console.error('Get unmapped events error:', error);
    res.status(500).json({ error: 'Failed to get unmapped events' });
  }
};

export const updateUnmappedEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateData: any = {};
    if (status) {
      if (!['open', 'handled', 'ignored'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }
      updateData.status = status;
      if (status === 'handled') {
        updateData.handledAt = new Date();
      }
    }
    if (notes !== undefined) updateData.notes = notes;

    const event = await UnmappedMultiCouponEvent.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('couponId')
      .populate('groupId')
      .populate('createdByUserId');

    if (!event) {
      res.status(404).json({ error: 'Unmapped event not found' });
      return;
    }

    res.json({
      id: event._id,
      multiCouponName: event.multiCouponName,
      couponId: event.couponId,
      groupId: event.groupId,
      createdByUserId: event.createdByUserId,
      status: event.status,
      adminNotifiedAt: event.adminNotifiedAt,
      handledAt: event.handledAt,
      notes: event.notes,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    });
  } catch (error) {
    console.error('Update unmapped event error:', error);
    res.status(500).json({ error: 'Failed to update unmapped event' });
  }
};
