import { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export const GroupSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  eventId: { type: String, required: true },
  isPublic: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  inviteToken: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(), // automatisch ein Token generieren
  },
});

GroupSchema.index({ eventId: 1 });
GroupSchema.index({ name: 'text' });
GroupSchema.index({ inviteToken: 1 }, { unique: true });
