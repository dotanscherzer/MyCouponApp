import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { NotificationPreference } from '../models/NotificationPreference.model';

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
      appRole: user.appRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { displayName, photoUrl } = req.body;
    const updateData: any = {};
    
    if (displayName !== undefined) updateData.displayName = displayName;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
      appRole: user.appRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({ error: 'Failed to update user information' });
  }
};

export const getNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    let preferences = await NotificationPreference.findOne({ userId: req.user.userId });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await NotificationPreference.create({
        userId: req.user.userId,
        enabled: true,
        daysBefore: [3, 7],
        timezone: 'Asia/Jerusalem',
        emailDigest: true,
      });
    }

    res.json({
      enabled: preferences.enabled,
      daysBefore: preferences.daysBefore,
      timezone: preferences.timezone,
      emailDigest: preferences.emailDigest,
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Failed to get notification preferences' });
  }
};

export const updateNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { enabled, daysBefore, timezone, emailDigest } = req.body;
    
    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId: req.user.userId },
      {
        enabled,
        daysBefore,
        timezone,
        emailDigest,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      enabled: preferences.enabled,
      daysBefore: preferences.daysBefore,
      timezone: preferences.timezone,
      emailDigest: preferences.emailDigest,
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
};
