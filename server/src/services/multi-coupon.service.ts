import { MultiCouponDefinition } from '../models/MultiCouponDefinition.model';
import { Coupon } from '../models/Coupon.model';
import { UnmappedMultiCouponEvent } from '../models/UnmappedMultiCouponEvent.model';
import { User } from '../models/User.model';
import { Types } from 'mongoose';
import { sendUnmappedAlertEmail } from './email.service';

export async function resolveMultiCoupon(multiCouponName: string): Promise<{
  mappingStatus: 'MAPPED' | 'UNMAPPED';
  resolvedStoreIds: string[];
} | null> {
  // Case-insensitive search
  const definition = await MultiCouponDefinition.findOne({
    name: { $regex: new RegExp(`^${multiCouponName}$`, 'i') },
    isActive: true,
  });

  if (definition) {
    return {
      mappingStatus: 'MAPPED',
      resolvedStoreIds: definition.storeIds.map(id => id.toString()),
    };
  }

  return {
    mappingStatus: 'UNMAPPED',
    resolvedStoreIds: [],
  };
}

export async function handleUnmappedCoupon(
  couponId: string,
  groupId: string,
  createdByUserId: string,
  multiCouponName: string
): Promise<void> {
  // Create UnmappedMultiCouponEvent
  await UnmappedMultiCouponEvent.create({
    multiCouponName,
    couponId: new Types.ObjectId(couponId),
    groupId: new Types.ObjectId(groupId),
    createdByUserId: new Types.ObjectId(createdByUserId),
    status: 'open',
    adminNotifiedAt: new Date(),
  });

  // Send email to all super_admin users
  const admins = await User.find({ appRole: 'super_admin' });
  const adminEmails = admins.map(admin => admin.email);

  if (adminEmails.length > 0) {
    try {
      await sendUnmappedAlertEmail(adminEmails, multiCouponName, couponId);
    } catch (error) {
      console.error('Failed to send unmapped alert email:', error);
      // Continue even if email fails
    }
  }
}

export async function resolveUnmappedCoupons(definitionId: string): Promise<number> {
  const definition = await MultiCouponDefinition.findById(definitionId);
  if (!definition) {
    throw new Error('MultiCouponDefinition not found');
  }

  // Find all UNMAPPED coupons with this multiCouponName
  const unmappedCoupons = await Coupon.find({
    type: 'MULTI',
    multiCouponName: { $regex: new RegExp(`^${definition.name}$`, 'i') },
    mappingStatus: 'UNMAPPED',
  });

  // Update each coupon
  let resolvedCount = 0;
  for (const coupon of unmappedCoupons) {
    await Coupon.findByIdAndUpdate(coupon._id, {
      mappingStatus: 'MAPPED',
      resolvedStoreIds: definition.storeIds,
    });

    // Update related events
    await UnmappedMultiCouponEvent.updateMany(
      {
        couponId: coupon._id,
        status: 'open',
      },
      {
        status: 'handled',
        handledAt: new Date(),
      }
    );

    resolvedCount++;
  }

  return resolvedCount;
}
