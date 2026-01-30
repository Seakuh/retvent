import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RegionVibeRatingDocument extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Region', required: true, index: true })
  regionId: Types.ObjectId;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({
    type: {
      energy: { type: Number, required: true, min: 0, max: 100 },
      intimacy: { type: Number, required: true, min: 0, max: 100 },
      exclusivity: { type: Number, required: true, min: 0, max: 100 },
      social: { type: Number, required: true, min: 0, max: 100 },
    },
    required: true,
  })
  vibe: {
    energy: number;
    intimacy: number;
    exclusivity: number;
    social: number;
  };
}

export const RegionVibeRatingSchema =
  SchemaFactory.createForClass(RegionVibeRatingDocument);

// Compound Index für schnelle Abfragen nach Region und User
RegionVibeRatingSchema.index({ regionId: 1, userId: 1 }, { unique: true });
