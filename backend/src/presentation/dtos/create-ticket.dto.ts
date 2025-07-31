// create-ticket.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  eventId: string;

  @IsEmail()
  email: string;
}
