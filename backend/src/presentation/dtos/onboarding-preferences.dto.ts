import { IsObject, IsOptional, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PreferenceCategoryDto {
  [key: string]: string[];
}

export class OnboardingPreferencesDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PreferenceCategoryDto)
  eventType?: PreferenceCategoryDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PreferenceCategoryDto)
  genreStyle?: PreferenceCategoryDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PreferenceCategoryDto)
  context?: PreferenceCategoryDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PreferenceCategoryDto)
  communityOffers?: PreferenceCategoryDto;

  @IsOptional()
  @IsString()
  region?: string;
}

