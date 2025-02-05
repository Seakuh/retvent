import { IsString, IsOptional, IsNumber, IsUrl } from 'class-validator';

export class CreateEventDto {
  @IsString()
  name: string;

  @IsString()
  date: string;

  @IsString()
  location: string;

  @IsString()
  description: string;

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
