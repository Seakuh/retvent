import { model, Schema, Types } from 'mongoose';

const CommentSchema = new Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  eventId: { type: Types.ObjectId, ref: 'Event', required: true },
  parentId: { type: Types.ObjectId, ref: 'Comment', default: null },
});

export const Comment = model('Comment', CommentSchema);
