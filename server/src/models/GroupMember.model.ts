import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGroupMember extends Document {
  groupId: Types.ObjectId;
  userId: Types.ObjectId;
  role: 'viewer' | 'editor' | 'admin';
  status: 'active' | 'removed';
  createdAt: Date;
  updatedAt: Date;
}

const groupMemberSchema = new Schema<IGroupMember>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'removed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index
groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
groupMemberSchema.index({ groupId: 1 });
groupMemberSchema.index({ userId: 1 });

export const GroupMember = mongoose.model<IGroupMember>('GroupMember', groupMemberSchema);
