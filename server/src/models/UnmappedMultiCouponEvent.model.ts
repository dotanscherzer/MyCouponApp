import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUnmappedMultiCouponEvent extends Document {
  multiCouponName: string;
  couponId: Types.ObjectId;
  groupId: Types.ObjectId;
  createdByUserId: Types.ObjectId;
  status: 'open' | 'handled' | 'ignored';
  adminNotifiedAt?: Date;
  handledAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const unmappedMultiCouponEventSchema = new Schema<IUnmappedMultiCouponEvent>(
  {
    multiCouponName: {
      type: String,
      required: true,
      trim: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
      index: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'handled', 'ignored'],
      default: 'open',
    },
    adminNotifiedAt: Date,
    handledAt: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
unmappedMultiCouponEventSchema.index({ status: 1, createdAt: -1 });
unmappedMultiCouponEventSchema.index({ couponId: 1 });

export const UnmappedMultiCouponEvent = mongoose.model<IUnmappedMultiCouponEvent>(
  'UnmappedMultiCouponEvent',
  unmappedMultiCouponEventSchema
);
