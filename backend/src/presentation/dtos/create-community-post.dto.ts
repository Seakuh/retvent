import { IsOptional, IsString } from 'class-validator';

export class CreateCommunityPostDto {
  @IsString()
  communityId: string;

  @IsString()
  @IsOptional()
  type: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  image: string;
}
