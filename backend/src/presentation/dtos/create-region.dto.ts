import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VibeDto {
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

export class CoordinatesDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class CreateRegionDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  parentRegion?: string; // Land/State

  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto;

  @ValidateNested()
  @Type(() => VibeDto)
  @IsOptional()
  vibe?: VibeDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  serviceIds?: string[];

  // SEO-Felder
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  h1?: string;

  @IsString()
  @IsOptional()
  introText?: string;
}
