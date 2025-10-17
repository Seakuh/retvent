import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema()
export class Post {
  @Prop({ required: true })
  profileId: string;

  @Prop({ required: true })
  eventId: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  type: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop()
  userName?: string;

  @Prop()
  feedImageUrl?: string;

  @Prop()
  feedGifUrl?: string;
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
