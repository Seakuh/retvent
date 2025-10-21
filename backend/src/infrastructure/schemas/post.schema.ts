import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Comment } from 'src/core/domain/comment';

export type PostDocument = Post & Document;

@Schema()
export class Post {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: false })
  likeIds?: string[];

  @Prop({ required: true })
  communityId: string;

  @Prop({ required: false })
  eventId: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  startDate: Date;

  @Prop({ required: false })
  type: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop()
  userName?: string;

  @Prop()
  feedImageUrls?: string[];

  @Prop()
  feedGifUrl?: string;

  @Prop()
  comments?: Comment[];
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ communityId: 1, createdAt: -1, _id: -1 });
PostSchema.index({ authorId: 1, createdAt: -1, _id: -1 });
PostSchema.index({ communityId: 1, isPinned: -1, createdAt: -1 });
PostSchema.index({ tags: 1, communityId: 1, createdAt: -1 });
PostSchema.index({ isDeleted: 1, communityId: 1 });
PostSchema.index(
  { text: 'text', title: 'text' },
  { weights: { title: 3, text: 1 } },
);
