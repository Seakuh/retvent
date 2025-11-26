import { IsNumber, IsString, Min, Max } from 'class-validator';
import { IsDateString } from 'class-validator';

export class CreateAssessmentDto {
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
