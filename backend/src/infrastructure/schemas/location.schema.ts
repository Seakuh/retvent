import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class LocationDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  logoUrl: string;

  @Prop()
  website?: string;

  @Prop()
  whatsappGroupLink?: string;

  @Prop()
  youtubeLink?: string;

  @Prop({
    type: {
      instagram: String,
      facebook: String,
      twitter: String
    }
  })
  socialMediaLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };

  @Prop({
    type: {
      latitude: Number,
      longitude: Number
    },
    required: true,
    index: '2dsphere'
  })
  coordinates: {
    latitude: number;
    longitude: number;
  };

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop([String])
  eventIds: string[];

  @Prop([String])
  followerIds: string[];

  @Prop([String])
  likeIds: string[];
}

export const LocationSchema = SchemaFactory.createForClass(LocationDocument); 