import { IsDateString, IsOptional, IsString } from 'class-validator';

export class PlanReleaseDto {
  @IsDateString()
  releaseDate: string; // ISO 8601 Datum-String (z.B. "2024-12-31T10:00:00Z")

  @IsOptional()
  @IsString()
  eventId?: string; // Optional, falls nicht im URL-Parameter übergeben
}
