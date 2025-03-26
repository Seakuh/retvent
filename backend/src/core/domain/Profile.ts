import { Document, model, Schema } from 'mongoose';

export interface IProfile extends Document {
  username: string;
  email?: string;
  // reference to user id
  userId: string;
  profileImageUrl?: string;
  headerImageUrl?: string;
  category?: string;
  followerCount?: number;
  bio?: string;
  followedLocationIds?: string[];
  likedEventIds?: string[];
  createdEventIds?: string[];
  links?: string[];
  followers?: string[];
  following?: string[];
  createdAt: Date;
  updatedAt: Date;
  queue?: string;
  doorPolicy?: string;
}

const ProfileSchema = new Schema<IProfile>({
  username: { type: String, required: true },
  email: { type: String, required: false },
  userId: { type: String, required: true },
  profileImageUrl: { type: String },
  category: { type: String },
  followerCount: { type: Number, default: 0 },
  headerImageUrl: { type: String },
  bio: { type: String },
  followedLocationIds: { type: [String] },
  likedEventIds: { type: [String] },
  createdEventIds: { type: [String] },
  links: { type: [String] },
  doorPolicy: { type: String },
  queue: { type: String },
  followers: { type: [String] },
  following: { type: [String] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProfileSchema.index({ username: 1 }, { unique: true });
ProfileSchema.index({ userId: 1 }, { unique: true });

export const Profile = model<IProfile>('Profile', ProfileSchema);
