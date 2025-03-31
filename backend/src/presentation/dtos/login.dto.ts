import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class LoginV2Dto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
