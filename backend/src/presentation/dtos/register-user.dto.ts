import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  password: string;
}
export class RegisterUserDtoV2 {
  @IsEmail()
  email: string;

  @IsOptional()
  prompt: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  password: string;
}
