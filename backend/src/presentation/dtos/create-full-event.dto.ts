import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class LineupItemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;
}

class AddressDto {
  @IsString()
  street: string;

  @IsString()
  houseNumber: string;

  @IsString()
  city: string;
}

class SocialMediaLinksDto {
  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  twitter?: string;
}

export class CreateFullEventDto {
  // Titel
  @IsString()
  title: string;

  // Beschreibung
  @IsOptional()
  @IsString()
  description?: string;

  // Bild URL
  @IsOptional()
  @IsString()
  image?: Express.Multer.File;

  // Zeitliche Daten
  @IsDateString()
  startDate: Date;

  @IsString()
  startTime: string;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  isSponsored?: boolean;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  // Beziehungen
  @IsString()
  hostId: string;

  @IsOptional()
  @IsString()
  hostUsername?: string;
  @IsOptional()
  @IsString()
  remoteUrl?: string;

  @IsOptional()
  @IsString()
  hostImageUrl?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsString()
  ticketLink?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineupItemDto)
  lineup?: LineupItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaLinksDto)
  socialMediaLinks?: SocialMediaLinksDto;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  validators?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventPictures?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lineupPictureUrl?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videoUrls?: string[];

  @IsOptional()
  @IsEmail()
  email?: string;

  // upload location
  @IsOptional()
  @IsNumber()
  uploadLat?: number;

  @IsOptional()
  @IsNumber()
  uploadLon?: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;
}
