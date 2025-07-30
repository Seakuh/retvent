import {
  IsString,
  IsOptional,
  IsNumber,
  IsUrl,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsNotEmpty()
  organizerId: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsNumber()
  eventLat?: number;

  @IsOptional()
  @IsNumber()
  eventLon?: number;

  @IsOptional()
  @IsUrl()
  ticketUrl?: string;
}
