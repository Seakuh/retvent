import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EventDocument extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  locationId: string;

  @Prop({ required: true })
  creatorId: string;

  @Prop({ default: [] })
  likedBy: string[];

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: [] })
  artistIds: string[];
}

export const EventSchema = SchemaFactory.createForClass(EventDocument); 