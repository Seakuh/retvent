import { 
  IsString, IsOptional, IsArray, IsUrl, ValidateNested, 
  IsNumber, Matches, IsDateString, IsObject 
} from 'class-validator';
import { Type } from 'class-transformer';

class SocialMediaLinksDto {
  @IsUrl()
  @IsOptional()
  instagram?: string;

  @IsUrl()
  @IsOptional()
  facebook?: string;

  @IsUrl()
  @IsOptional()
  twitter?: string;
}

class LineupArtistDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  startTime?: string;
}

class CoordinatesDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

class LocationDto {
  @IsString()
  address: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;
}

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'startTime must be in format HH:mm'
  })
  startTime: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsString()
  @IsOptional()
  ticketLink?: string;

  @IsString()
  @IsOptional()
  lineup?: string;

  @IsString()
  @IsOptional()
  socialMediaLinks?: string;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  communityId?: string;

  @IsString()
  @IsOptional()
  parentEventId?: string;
}
