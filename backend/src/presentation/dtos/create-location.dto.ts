import { IsString, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class CreateLocationDto {
  
  @IsString()
  name: string;

  
  @IsUrl()
  logoUrl: string;

  
  @IsNumber()
  latitude: number;

  
  @IsNumber()
  longitude: number;

  
  @IsString()
  address: string;

   
  @IsOptional()
  @IsUrl()
  website?: string;

   
  @IsOptional()
  @IsUrl()
  whatsappGroupLink?: string;

   
  @IsOptional()
  @IsUrl()
  youtubeLink?: string;

   
  @IsOptional()
  socialMediaLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
} 