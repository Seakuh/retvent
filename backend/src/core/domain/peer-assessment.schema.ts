import { Schema, Document } from 'mongoose';

export interface IPeerAssessment extends Document {
  assessorUserId: string; // User der bewertet
  assessedUserId: string; // User der bewertet wird
  groupId: string; // Gruppe in der sie zusammen sind
  passiveAggressive: number; // 0-10 (0 = passiv, 10 = aggressiv)
  tightLoose: number; // 0-10 (0 = tight, 10 = loose)
  playStyle: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const PeerAssessmentSchema = new Schema<IPeerAssessment>(
  {
    assessorUserId: { type: String, required: true },
    assessedUserId: { type: String, required: true },
    groupId: { type: String, required: true },
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
PeerAssessmentSchema.index({ assessorUserId: 1, assessedUserId: 1 }, { unique: true });
PeerAssessmentSchema.index({ assessedUserId: 1 });
PeerAssessmentSchema.index({ groupId: 1 });
