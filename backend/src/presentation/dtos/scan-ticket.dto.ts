import { IsString } from 'class-validator';

/**
 * DTO for scanning and validating a ticket (e.g., at event entrance).
 * The QR code contains the ticket hash which is used for validation.
 */
export class ScanTicketDto {
  @IsString()
  ticketId: string;

  @IsString()
  hash: string;
}
