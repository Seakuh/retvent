export class Ticket {
  eventId: string;
  email: string;
  ticketId: string;
  status: string;
  createdAt: Date;
  hash: string;
  validatedAt?: Date; // Optional: Timestamp when ticket was scanned/validated at entrance
}
