import { Schema } from 'mongoose';

export const CommunitySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  codeOfConduct: { type: String, required: false },
  creatorId: { type: String, required: true },
  isPublic: { type: Boolean, required: true },
  imageUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  private: { type: Boolean, required: false },
  members: { type: [String], required: false },
  admins: { type: [String], required: false },
  moderators: { type: [String], required: false },
  bannedUsers: { type: [String], required: false },
  eventIds: { type: [String], required: false },
});
