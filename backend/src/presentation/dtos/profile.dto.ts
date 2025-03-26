import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { IsNotEmpty } from 'class-validator';

export class ProfileInfoDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  profileImageUrl: string;

  @IsString()
  @IsOptional()
  headerImageUrl: string;

  @IsString()
  @IsOptional()
  category: string;

  @IsNumber()
  @IsOptional()
  followerCount: number;

  @IsString()
  @IsOptional()
  bio: string;

  @IsArray()
  @IsOptional()
  links: string[];

  @IsDate()
  @IsOptional()
  createdAt: Date;
}
