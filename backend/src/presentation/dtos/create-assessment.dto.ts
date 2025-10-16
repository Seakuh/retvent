import { IsNumber, IsString } from 'class-validator';

import { IsDateString } from 'class-validator';

export class CreateAssessmentDto {
  @IsNumber()
  loose: number;
  @IsNumber()
  tight: number;
  @IsNumber()
  aggressive: number;
  @IsNumber()
  passive: number;
  @IsString()
  playStyle: string;
  @IsDateString()
  submittedAt: Date;
}
