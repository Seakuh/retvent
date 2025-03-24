import { Document, model, Schema } from 'mongoose';

export interface IProfile extends Document {
  username: string;
  email?: string;
  userId: string;
  password?: string;
  profileImageUrl?: string;
  category?: string;
  bio?: string;
  followedLocationIds?: string[];
  likedEventIds?: string[];
  createdEventIds?: string[];
  links?: string[];
  doorPolicy?: string;
  followers?: string[];
  following?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>({
  username: { type: String, required: true },
  email: { type: String, required: false },
  userId: { type: String, required: true },
  profileImageUrl: { type: String },
  category: { type: String },
  bio: { type: String },
  followedLocationIds: { type: [String] },
  likedEventIds: { type: [String] },
  createdEventIds: { type: [String] },
  links: { type: [String] },
  doorPolicy: { type: String },
  followers: { type: [String] },
  following: { type: [String] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProfileSchema.index({ username: 1 }, { unique: true });

export const Profile = model<IProfile>('Profile', ProfileSchema);
