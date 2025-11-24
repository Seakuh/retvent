export interface AssessmentDataPoint {
  loose: number;
  tight: number;
  aggressive: number;
  passive: number;
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
