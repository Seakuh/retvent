import { Schema, Document } from 'mongoose';

export interface ISelfAssessment extends Document {
  userId: string;
  passiveAggressive: number; // 0-10 (0 = passiv, 10 = aggressiv)
  tightLoose: number; // 0-10 (0 = tight, 10 = loose)
  playStyle: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const SelfAssessmentSchema = new Schema<ISelfAssessment>(
  {
    userId: { type: String, required: true, unique: true },
    passiveAggressive: { type: Number, required: true, min: 0, max: 10 },
    tightLoose: { type: Number, required: true, min: 0, max: 10 },
    playStyle: { type: String, required: true },
    submittedAt: { type: Date, required: true },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// Index für schnelle Abfragen
SelfAssessmentSchema.index({ userId: 1 }, { unique: true });
