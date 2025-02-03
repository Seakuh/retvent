import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UserDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  artistName?: string;

  @Prop()
  profileImage?: string;

  @Prop()
  bio?: string;

  @Prop({ default: false })
  isArtist: boolean;

  @Prop([String])
  ownedLocationIds: string[];

  @Prop({ default: [] })
  likedEventIds: string[];

  @Prop({ default: [] })
  createdEventIds: string[];

  @Prop({ default: [] })
  followedLocationIds: string[];

  @Prop({ default: [] })
  followedArtistIds: string[];
}

export const UserSchema = SchemaFactory.createForClass(UserDocument); 