import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMultiCouponDefinition extends Document {
  name: string;
  storeIds: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const multiCouponDefinitionSchema = new Schema<IMultiCouponDefinition>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    storeIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
multiCouponDefinitionSchema.index({ name: 1 }, { unique: true });

export const MultiCouponDefinition = mongoose.model<IMultiCouponDefinition>(
  'MultiCouponDefinition',
  multiCouponDefinitionSchema
);
