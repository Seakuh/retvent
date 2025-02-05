import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EventDocument extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  startTime: string;

  @Prop()
  endDate?: Date;

  @Prop()
  endTime?: string;

  @Prop({ required: true })
  organizerId: string;

  @Prop({ required: true })
  locationId: string;

  @Prop([String])
  artistIds: string[];

  @Prop([String])
  likeIds: string[];
}

export const EventSchema = SchemaFactory.createForClass(EventDocument); 