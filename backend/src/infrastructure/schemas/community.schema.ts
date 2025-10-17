import { Schema } from 'mongoose';

export const CommunitySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  codeOfConduct: { type: String, required: false },
  creatorId: { type: String, required: true },
  isPublic: { type: Boolean, required: true },
  imageUrl: { type: String, required: false },
});
