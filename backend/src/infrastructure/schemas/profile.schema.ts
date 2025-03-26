import { Schema } from 'mongoose';

export const ProfileSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: false },
  userId: { type: String, required: true },
  profileImageUrl: { type: String },
  category: { type: String },
  followerCount: { type: Number, default: 0 },
  headerImageUrl: { type: String },
  bio: { type: String },
  followedLocationIds: { type: [String] },
  gallery: { type: [String] },
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
