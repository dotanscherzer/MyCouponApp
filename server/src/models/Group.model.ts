import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  ownerUserId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Group = mongoose.model<IGroup>('Group', groupSchema);
