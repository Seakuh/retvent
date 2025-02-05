import { Schema } from 'mongoose';

export const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: String,
  bio: String,
  followedLocationIds: [String],
  likedEventIds: [String],
  createdEventIds: [String]
}, { timestamps: true }); 