import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RegionDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop()
  logoUrl?: string;

  @Prop([String])
  images?: string[];

  @Prop({
    type: {
      energy: { type: Number, min: 0, max: 100 },
      intimacy: { type: Number, min: 0, max: 100 },
      exclusivity: { type: Number, min: 0, max: 100 },
      social: { type: Number, min: 0, max: 100 },
    },
  })
  vibe?: {
    energy: number;
    intimacy: number;
    exclusivity: number;
    social: number;
  };

  @Prop({
    type: {
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false },
    },
  })
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  @Prop()
  address?: string;

  @Prop()
  country?: string;

  @Prop()
  parentRegion?: string; // Land/State

  @Prop([String])
  eventIds?: string[];

  @Prop([String])
  serviceIds?: string[];

  @Prop([String])
  commentIds?: string[];

  @Prop([String])
  likeIds?: string[];

  @Prop({ type: Number, default: 0 })
  shareCount?: number;

  @Prop([String])
  followerIds?: string[];

  // SEO-Felder
  @Prop()
  metaDescription?: string;

  @Prop()
  h1?: string;

  @Prop()
  introText?: string;
}

export const RegionSchema = SchemaFactory.createForClass(RegionDocument);

// 2dsphere Index für geografische Suche
RegionSchema.index(
  { 'coordinates.latitude': 1, 'coordinates.longitude': 1 },
  { sparse: true },
);

// Text Index für Suche
RegionSchema.index({ name: 'text', description: 'text' });

// Index für slug (bereits durch unique: true)
// Index für eventIds für schnelle Event-Abfragen
RegionSchema.index({ eventIds: 1 });
