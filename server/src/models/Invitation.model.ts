import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInvitation extends Document {
  groupId: Types.ObjectId;
  invitedEmail: string;
  role: 'viewer' | 'editor' | 'admin';
  tokenHash: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitedByUserId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    invitedEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired', 'cancelled'],
      default: 'pending',
    },
    invitedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
invitationSchema.index({ groupId: 1 });
invitationSchema.index({ tokenHash: 1 });

export const Invitation = mongoose.model<IInvitation>('Invitation', invitationSchema);
