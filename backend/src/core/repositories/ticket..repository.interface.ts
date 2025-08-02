import { Ticket } from '../domain/ticket';

export interface ITicketRepository {
  createTicket(userId: string, ticket: Ticket): Promise<Ticket>;
  createTicketWithEvent(ticket: Ticket): Promise<Ticket>;
  findById(id: string): Promise<Ticket | null>;
  update(id: string, ticket: Ticket): Promise<Ticket | null>;
  delete(id: string): Promise<boolean>;
}
