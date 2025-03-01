import { IsEmail, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  password: string;

} 