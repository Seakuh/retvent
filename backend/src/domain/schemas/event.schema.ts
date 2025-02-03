import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  title: string;

  // ... andere Properties ...

  @Prop({ default: [] })
  likedBy: string[];

  @Prop({ default: 0 })
  likesCount: number;
}

export const EventSchema = SchemaFactory.createForClass(Event); 