import { IsDateString, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreatePeerAssessmentDto {
  @IsString()
  assessedUserId: string; // User der bewertet wird

  @IsString()
  groupId: string; // Gruppe in der sie zusammen sind

  @IsNumber()
  @Min(1)
  @Max(10)
  loose: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  tight: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  aggressive: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  passive: number;

  @IsString()
  playStyle: string;

  @IsDateString()
  submittedAt: Date;
}
