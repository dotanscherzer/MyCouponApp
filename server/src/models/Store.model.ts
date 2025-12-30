import mongoose, { Schema, Document } from 'mongoose';

export interface IStore extends Document {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<IStore>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
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
storeSchema.index({ name: 1 }, { unique: true });

export const Store = mongoose.model<IStore>('Store', storeSchema);
