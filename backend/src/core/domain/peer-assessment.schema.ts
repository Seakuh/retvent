import { Schema, Document } from 'mongoose';

export interface IPeerAssessment extends Document {
  assessorId: string; // User der bewertet
  assessedId: string; // User der bewertet wird
  groupId: string; // Gruppe in der sie zusammen sind
  loose: number; // 1-10
  tight: number; // 1-10
  aggressive: number; // 1-10
  passive: number; // 1-10
  playStyle: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const PeerAssessmentSchema = new Schema<IPeerAssessment>(
  {
    assessorId: { type: String, required: true },
    assessedId: { type: String, required: true },
    groupId: { type: String, required: true },
    loose: { type: Number, required: true, min: 1, max: 10 },
    tight: { type: Number, required: true, min: 1, max: 10 },
    aggressive: { type: Number, required: true, min: 1, max: 10 },
    passive: { type: Number, required: true, min: 1, max: 10 },
    playStyle: { type: String, required: true },
    submittedAt: { type: Date, required: true },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// Index für schnelle Abfragen
PeerAssessmentSchema.index({ assessorId: 1, assessedId: 1 }, { unique: true });
PeerAssessmentSchema.index({ assessedId: 1 });
PeerAssessmentSchema.index({ groupId: 1 });
