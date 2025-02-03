import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: [] })
  likedEvents: string[];

  @Prop({ default: [] })
  createdEvents: string[];

  @Prop({ default: [] })
  followedLocations: string[];

  @Prop({ default: [] })
  followedArtists: string[];

  @Prop()
  profileImage?: string;

  @Prop()
  bio?: string;
}

export const UserSchema = SchemaFactory.createForClass(User); 