import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  website?: string;

  // @IsString()
  // @IsOptional()
  // socialMediaLinks?: SocialMediaLinksDto;
  @IsArray()
  @IsOptional()
  links?: string[];
  @IsString()
  @IsOptional()
  doorPolicy?: string;

  @IsString()
  @IsOptional()
  category?: string;

  // Images

  @IsString()
  @IsOptional()
  headerImageUrl?: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsArray()
  @IsOptional()
  gallery?: string[];

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

// export class SocialMediaLinksDto {
//   @IsUrl()
//   @IsOptional()
//   instagram?: string;

//   @IsUrl()
//   @IsOptional()
//   facebook?: string;

//   @IsUrl()
//   @IsOptional()
//   twitter?: string;
// }
