import { Schema } from 'mongoose';

export const FeedSchema = new Schema({
  profileId: { type: String, required: true },
  eventId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
