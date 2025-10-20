import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
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

  @IsOptional()
  image: Buffer;

  @IsString()
  @IsOptional()
  videoUrl: string;

  @IsString()
  @IsOptional()
  audioUrl: string;

  @IsString()
  @IsOptional()
  documentUrl: string;
}
