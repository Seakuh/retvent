import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class GrooveCast extends Document {
  @Prop({ required: true })
  soundcloudUrl: string;

  @Prop({ required: true })
  season: number;

  @Prop({ required: true })
  imageUrl: string;
}

export const GroovecastSchema = SchemaFactory.createForClass(GrooveCast);
