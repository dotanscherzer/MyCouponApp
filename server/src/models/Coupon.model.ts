import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICouponImage {
  _id: Types.ObjectId;
  url: string;
  fileName?: string;
  mimeType?: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface ICoupon extends Document {
  groupId: Types.ObjectId;
  createdByUserId: Types.ObjectId;
  type: 'SINGLE' | 'MULTI';
  title: string;
  storeId?: Types.ObjectId;
  multiCouponName?: string;
  mappingStatus: 'MAPPED' | 'UNMAPPED';
  resolvedStoreIds: Types.ObjectId[];
  expiryDate: Date;
  totalAmount: number;
  usedAmount: number;
  remainingAmount: number;
  currency: 'ILS' | 'USD' | 'EUR';
  status: 'ACTIVE' | 'PARTIALLY_USED' | 'USED' | 'EXPIRED' | 'CANCELLED';
  images: ICouponImage[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const couponImageSchema = new Schema<ICouponImage>(
  {
    url: {
      type: String,
      required: true,
    },
    fileName: String,
    mimeType: String,
    isPrimary: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const couponSchema = new Schema<ICoupon>(
  {
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
    type: {
      type: String,
      enum: ['SINGLE', 'MULTI'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: function (this: ICoupon) {
        return this.type === 'SINGLE';
      },
    },
    multiCouponName: {
      type: String,
      required: function (this: ICoupon) {
        return this.type === 'MULTI';
      },
      trim: true,
    },
    mappingStatus: {
      type: String,
      enum: ['MAPPED', 'UNMAPPED'],
      default: 'MAPPED',
    },
    resolvedStoreIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Store',
      },
    ],
    expiryDate: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    usedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['ILS', 'USD', 'EUR'],
      default: 'ILS',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PARTIALLY_USED', 'USED', 'EXPIRED', 'CANCELLED'],
      default: 'ACTIVE',
    },
    images: [couponImageSchema],
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
couponSchema.index({ groupId: 1, status: 1 });
couponSchema.index({ groupId: 1, expiryDate: 1 });
couponSchema.index({ resolvedStoreIds: 1 }); // multikey index
couponSchema.index({ groupId: 1, storeId: 1 });
couponSchema.index({ groupId: 1, mappingStatus: 1, multiCouponName: 1 });

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
