import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Artist extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  biography?: string;

  @Prop()
  basedIn?: string;

  @Prop()
  careerStartDate?: Date;

  @Prop([String])
  genres?: string[];

  @Prop([String])
  aliases?: string[];

  @Prop([String])
  languages?: string[];

  // Social Media & Web presence 🌐
  @Prop()
  instagramUrl?: string;

  @Prop()
  websiteUrl?: string;

  @Prop()
  soundcloudUrl?: string;

  @Prop()
  bandcampUrl?: string;

  @Prop()
  spotifyUrl?: string;

  @Prop()
  youtubeChannel?: string;

  @Prop()
  mixcloudUrl?: string;

  @Prop()
  twitterUrl?: string;

  @Prop()
  facebookUrl?: string;

  @Prop()
  tiktokUrl?: string;

  // Media Content 📸
  @Prop()
  profileImageUrl?: string;

  @Prop([String])
  galleryImages?: string[];

  @Prop([String])
  videoUrls?: string[];

  @Prop([String])
  musicSamples?: string[];

  @Prop()
  pressKit?: string;

  // Business & Booking Information 💼
  @Prop()
  bookingEmail?: string;

  @Prop()
  managementEmail?: string;

  @Prop()
  pressEmail?: string;

  @Prop({
    type: {
      hourlyRate: Number,
      performanceRate: Number,
      currency: String,
    }
  })
  fees?: {
    hourlyRate?: number;
    performanceRate?: number;
    currency: string;
  };

  @Prop()
  availability?: boolean;

  // Technical Requirements 🎛
  @Prop()
  technicalRequirements?: string;

  @Prop([String])
  riders?: string[];

  @Prop()
  preferredSetupTime?: number;

  @Prop({
    type: {
      width: Number,
      depth: Number,
      unit: String,
    }
  })
  minimumStageSize?: {
    width: number;
    depth: number;
    unit: string;
  };

  // Achievements 🏆
  @Prop([{
    name: String,
    year: Number,
    description: String,
  }])
  awards?: Array<{
    name: string;
    year: number;
    description?: string;
  }>;

  @Prop([{
    publication: String,
    date: Date,
    url: String,
  }])
  pressFeatures?: Array<{
    publication: string;
    date: Date;
    url?: string;
  }>;

  // Relations 🤝
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organiser' })
  organiserId?: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Event' }] })
  eventIds?: string[];
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);