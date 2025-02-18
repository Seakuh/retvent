// event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { Document } from 'mongoose';

@Schema()
export class Event extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  date: string;

  @Prop({ required: false })
  location: string;

  @Prop({ required: false })
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

  // @Prop({
  //   type: {
  //     type: String,
  //     enum: ['Point'],
  //     required: true,
  //   },
  //   coordinates: {
  //     type: [Number],
  //     required: true,
  //     index: '2dsphere',
  //   },
  // })
  // @IsOptional()
  // geoLocation?: {
  //   type?: 'Point';
  //   coordinates?: [number, number];
  // };
}

export const EventSchema = SchemaFactory.createForClass(Event);

// WICHTIG: Index explizit setzen
EventSchema.index({ geoLocation: '2dsphere' });