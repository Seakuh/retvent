import { IsEmail, IsString } from 'class-validator';

/**
 * DTO for activating a ticket.
 * Used when a guest accepts an invitation and activates their ticket.
 */
export class ActivateTicketDto {
  @IsString()
  ticketId: string;

  @IsEmail()
  email: string;

  @IsString()
  hash: string;
}
