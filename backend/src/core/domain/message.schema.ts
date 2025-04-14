import { Schema } from 'mongoose';

export const MessageSchema = new Schema({
  groupId: { type: String, required: true },
  senderId: { type: String, required: true },
  fileUrl: { type: String, required: false },
  content: { type: String, required: false },
  type: { type: String, enum: ['text', 'image'], default: 'text' },
  createdAt: { type: Date, default: Date.now },
});
