export interface AssessmentDataPoint {
  passiveAggressive: number; // 0 = passiv, 10 = aggressiv (X-Achse)
  tightLoose: number; // 0 = tight, 10 = loose (Y-Achse)
  playStyle: string;
}

export interface PeerAssessmentData extends AssessmentDataPoint {
  assessorId: string;
  assessorUsername?: string;
  submittedAt: Date;
}

export class AssessmentMatrixDto {
  userId: string;
  selfAssessment?: AssessmentDataPoint; // Grüner Punkt
  peerAssessments: PeerAssessmentData[]; // Bewertungen von anderen
  averagePeerAssessment?: AssessmentDataPoint; // Durchschnitt der Peer-Bewertungen
}
