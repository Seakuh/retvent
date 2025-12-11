import { Schema } from 'mongoose';

export const ProfileSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: false },
  userId: { type: String, required: false },
  profileImageUrl: { type: String },
  category: { type: String },
  followerCount: { type: Number, default: 0 },
  headerImageUrl: { type: String },
  telephoneNumber: { type: String },
  bio: { type: String },
  badges: { type: [String] },
  achievements: { type: [String] },
  followedLocationIds: { type: [String] },
  gallery: { type: [String] },
  likedEventIds: { type: [String] },
  createdEventIds: { type: [String] },
  links: { type: [String], maxLength: 3 },
  doorPolicy: { type: String },
  queue: { type: String },
  giphyLinks: { type: [String] },
  followers: { type: [String] },
  following: { type: [String] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  preferences: { type: Object },
  embedding: { type: [Number] },
});

ProfileSchema.index({ username: 1 }, { unique: true });
