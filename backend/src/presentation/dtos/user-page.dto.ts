import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Event } from '../../core/domain/event';

export class UserPageDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  email: string;

  @IsString()
  bio: string;

  @IsString()
  profileImageUrl: string;

  @IsArray()
  events: Event[];
}
