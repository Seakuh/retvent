import { IsDateString, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreatePeerAssessmentDto {
  @IsString()
  assessedUserId: string; // User der bewertet wird

  @IsString()
  groupId: string; // Gruppe in der sie zusammen sind

  @IsNumber()
  @Min(0)
  @Max(10)
  passiveAggressive: number; // 0 = passiv, 10 = aggressiv

  @IsNumber()
  @Min(0)
  @Max(10)
  tightLoose: number; // 0 = tight, 10 = loose

  @IsString()
  playStyle: string;

  @IsDateString()
  submittedAt: Date;
}
