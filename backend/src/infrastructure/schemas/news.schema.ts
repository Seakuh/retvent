import { Schema } from 'mongoose';

export const NewsSchema = new Schema({
  title: { type: String, required: true },
  text: { type: String, required: false },
  userId: { type: String, required: true },
  imageUrl: { type: String, required: false },
  communityId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
