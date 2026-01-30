import { IsNumber, Min, Max } from 'class-validator';

export class VibeRatingDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  energy: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  intimacy: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  exclusivity: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  social: number;
}
