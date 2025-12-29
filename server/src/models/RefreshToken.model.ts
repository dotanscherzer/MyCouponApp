import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

// Indexes
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ tokenHash: 1 });
refreshTokenSchema.index({ expiresAt: 1 });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
