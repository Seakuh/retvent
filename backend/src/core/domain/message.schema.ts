import { Schema } from 'mongoose';

export const MessageSchema = new Schema({
  groupId: { type: String, required: true },
  senderId: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image'], default: 'text' },
  createdAt: { type: Date, default: Date.now },
});
