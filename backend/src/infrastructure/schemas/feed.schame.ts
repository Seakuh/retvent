import { Schema } from 'mongoose';

export const FeedSchema = new Schema({
  profileId: { type: String, required: true },
  eventId: { type: String, required: true },
  startDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  userName: { type: String, required: false },
  feedImageUrl: { type: String, required: false },
  feedGifUrl: { type: String, required: false },
});
