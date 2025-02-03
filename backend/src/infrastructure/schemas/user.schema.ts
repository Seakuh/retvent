import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UserDocument extends Document {
  @Prop({ required: true, unique: true })
  username: string;

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

  @Prop([String])
  createdEventIds: string[];

  @Prop([String])
  likedEventIds: string[];

  @Prop([String])
  likedLocationIds: string[];

  @Prop([String])
  followedLocationIds: string[];

  @Prop([String])
  performingEventIds: string[];
}

export const UserSchema = SchemaFactory.createForClass(UserDocument); 