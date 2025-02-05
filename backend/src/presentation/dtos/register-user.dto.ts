import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  artistName?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  isArtist: boolean = false;
} 