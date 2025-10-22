import { Schema } from 'mongoose';

export const MessageSchema = new Schema({
  groupId: { type: String, required: false },
  recipientId: { type: String, required: false },
  senderId: { type: String, required: true },
  fileUrl: { type: String, required: false },
  latitude: { type: Number, required: false },
  longitude: { type: Number, required: false },
  content: { type: String, required: false },
  type: { type: String, required: false },
  isPrivate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
