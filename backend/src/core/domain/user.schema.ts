import { Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: String,
    bio: String,
    followedLocationIds: [String],
    likedEventIds: [String],
    favoriteEventIds: [String],
    createdEventIds: [String],
    points: { type: Number, default: 0 },
    followedProfiles: { type: [String], default: [] },
  },
  { timestamps: true },
);
