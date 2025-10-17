import { IsOptional, IsString } from 'class-validator';

export class CreateCommunityPostDto {
  @IsString()
  communityId: string;

  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  type: string;
}
