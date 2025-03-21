import { Document, model, Schema } from 'mongoose';

export interface IComment extends Document {
  id: string;
  text: string;
  createdAt: Date;
  userId: string;
  eventId: string;
  parentId: string;
}

const CommentSchema = new Schema<IComment>({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: String, required: true },
  eventId: { type: String, required: true },
  parentId: { type: String, default: null },
});

CommentSchema.index({ eventId: 1 });

export interface IComment extends Document {
  id: string;
  text: string;
  createdAt: Date;
  userId: string;
  eventId: string;
  parentId: string;
}

export const Comment = model<IComment>('Comment', CommentSchema);
