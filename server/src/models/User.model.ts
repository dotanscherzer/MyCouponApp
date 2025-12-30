import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  googleId?: string;
  displayName: string;
  photoUrl?: string;
  appRole: 'user' | 'super_admin';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      required: false,
      sparse: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
      required: false,
    },
    appRole: {
      type: String,
      enum: ['user', 'super_admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

export const User = mongoose.model<IUser>('User', userSchema);
