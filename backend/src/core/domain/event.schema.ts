// event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Event extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  category?: string;

  @Prop()
  price?: string;

  @Prop()
  eventLat?: number;

  @Prop()
  eventLon?: number;

  @Prop()
  uploadLat?: number;

  @Prop()
  uploadLon?: number;

  @Prop()
  ticketUrl?: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
