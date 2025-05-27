import { IsString } from 'class-validator';

export class CreateArtistDtoV2 {
  @IsString()
  name: string;

  @IsString()
  prompt: string;

  @IsString()
  description: string;

  @IsString()
  email: string;

  @IsString()
  announcement: string;
}
