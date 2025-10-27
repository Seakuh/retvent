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
  isPublic: { type: Boolean, required: false },
  eventId: { type: Types.ObjectId, ref: 'Event', required: false },
  communityId: { type: Types.ObjectId, ref: 'Community', required: false },
  postId: { type: Types.ObjectId, ref: 'Post', required: false },
  parentId: { type: Types.ObjectId, ref: 'Comment', default: null },
  likeIds: { type: [String], default: [] },
});

// virtueller Getter
CommentSchema.virtual('likesCount').get(function () {
  return this.likeIds?.length || 0;
});
