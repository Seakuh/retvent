import { IsEmail, IsString } from 'class-validator';

export class InviteTicketDto {
  @IsString()
  eventId: string;

  @IsEmail()
  email: string;
}
