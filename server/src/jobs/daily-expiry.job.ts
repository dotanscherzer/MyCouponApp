import { Coupon } from '../models/Coupon.model';
import { NotificationPreference } from '../models/NotificationPreference.model';
import { GroupMember } from '../models/GroupMember.model';
import { User } from '../models/User.model';
import { calculateStatus } from '../services/coupons.service';
import { sendExpiryNotificationEmail } from '../services/email.service';
import { Types } from 'mongoose';

export interface DailyJobResult {
  expiredUpdated: number;
  emailsSent: number;
}

export async function runDailyExpiryJob(): Promise<DailyJobResult> {
  const result: DailyJobResult = {
    expiredUpdated: 0,
    emailsSent: 0,
  };

  try {
    // 1. Update expired coupons
    const now = new Date();
    const expiredCoupons = await Coupon.updateMany(
      {
        expiryDate: { $lt: now },
        status: { $nin: ['USED', 'CANCELLED', 'EXPIRED'] },
      },
      {
        $set: { status: 'EXPIRED' },
      }
    );

    result.expiredUpdated = expiredCoupons.modifiedCount || 0;

    // 2. Send expiry notifications
    const preferences = await NotificationPreference.find({ enabled: true });
    
    for (const preference of preferences) {
      const user = await User.findById(preference.userId);
      if (!user) continue;

      // Get user's groups
      const memberships = await GroupMember.find({
        userId: preference.userId,
        status: 'active',
      });

      const groupIds = memberships.map(m => m.groupId);

      if (groupIds.length === 0) continue;

      // Find coupons expiring in the specified days
      const expiringCouponsByDays: { [key: number]: any[] } = {};

      for (const daysBefore of preference.daysBefore) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysBefore);
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const coupons = await Coupon.find({
          groupId: { $in: groupIds },
          expiryDate: {
            $gte: targetDate,
            $lt: nextDay,
          },
          status: { $nin: ['USED', 'CANCELLED', 'EXPIRED'] },
        }).populate('groupId', 'name');

        if (coupons.length > 0) {
          expiringCouponsByDays[daysBefore] = coupons;
        }
      }

      // Send email if there are expiring coupons
      const allExpiringCoupons = Object.values(expiringCouponsByDays).flat();
      if (allExpiringCoupons.length > 0) {
        try {
          await sendExpiryNotificationEmail(user.email, allExpiringCoupons);
          result.emailsSent++;
        } catch (emailError) {
          console.error(`Failed to send expiry notification to ${user.email}:`, emailError);
        }
      }
    }
  } catch (error) {
    console.error('Daily expiry job error:', error);
    throw error;
  }

  return result;
}
