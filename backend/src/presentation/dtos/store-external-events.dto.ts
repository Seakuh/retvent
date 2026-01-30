import {
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  ValidateNested,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for a single external event to be stored
 * Based on the Event domain model structure
 */
export class ExternalEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lon?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsUrl()
  @IsOptional()
  ticketLink?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  @IsEnum(['concert', 'festival', 'club-night', 'theater', 'sports', 'workshop', 'networking', 'exhibition', 'conference', 'party', 'comedy', 'other'])
  eventType?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['live', 'hybrid', 'online', 'outdoor', 'indoor'])
  eventFormat?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genre?: string[];

  @IsString()
  @IsOptional()
  venueName?: string;

  @IsString()
  @IsOptional()
  organizerName?: string;

  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @IsString()
  @IsOptional()
  sourcePlatform?: string;
}

/**
 * DTO for storing multiple external events at once
 */
export class StoreExternalEventsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExternalEventDto)
  events: ExternalEventDto[];

  @IsString()
  @IsOptional()
  sourcePlatform?: string;

  @IsString()
  @IsOptional()
  region?: string;
}

/**
 * Response DTO for stored events
 */
export class StoredEventResponseDto {
  id: string;
  title: string;
  status: 'created' | 'updated' | 'skipped';
  message?: string;
}

export class StoreExternalEventsResponseDto {
  success: boolean;
  totalReceived: number;
  totalCreated: number;
  totalUpdated: number;
  totalSkipped: number;
  events: StoredEventResponseDto[];
}
