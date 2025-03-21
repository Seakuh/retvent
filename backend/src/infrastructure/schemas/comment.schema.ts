import { Schema, Types } from 'mongoose';

export const CommentSchema = new Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  userId: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function (v: any) {
        return typeof v === 'string' || v instanceof Types.ObjectId;
      },
      message: 'userId muss entweder ein String oder eine ObjectId sein',
    },
  },
  eventId: { type: Types.ObjectId, ref: 'Event', required: true },
  parentId: { type: Types.ObjectId, ref: 'Comment', default: null },
});
