import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotificationPreference extends Document {
  userId: Types.ObjectId;
  enabled: boolean;
  daysBefore: number[];
  timezone: string;
  emailDigest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    daysBefore: {
      type: [Number],
      default: [3, 7],
    },
    timezone: {
      type: String,
      default: 'Asia/Jerusalem',
    },
    emailDigest: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationPreferenceSchema.index({ userId: 1 }, { unique: true });

export const NotificationPreference = mongoose.model<INotificationPreference>(
  'NotificationPreference',
  notificationPreferenceSchema
);
