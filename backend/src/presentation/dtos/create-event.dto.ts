import { IsString, IsDate, IsArray, IsOptional } from 'class-validator';

export class CreateEventDto {
  
  @IsString()
  title: string;

  @IsString()
  description: string;

  
  @IsString()
  imageUrl: string;

  
  @IsDate()
  startDate: Date;

  
  @IsString()
  startTime: string;

  
  @IsString()
  locationId: string;

  @IsArray()
  @IsOptional()
  artistIds?: string[];
} 