import { Schema } from 'mongoose';

export const LocationSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    logoUrl: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    website: String,
    socialMediaLinks: {
      instagram: String,
      facebook: String,
      twitter: String,
    },
    ownerId: { type: String, required: true },
    followerIds: [String],
    likeIds: [String],
    eventsCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);
