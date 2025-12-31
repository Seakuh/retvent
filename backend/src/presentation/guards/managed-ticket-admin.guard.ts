import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { IEventRepository } from '../../core/repositories/event.repository.interface';
import { IManagedTicketRepository } from '../../core/repositories/managed-ticket.repository.interface';

/**
 * Verifies that the authenticated user is the host of the event
 * associated with the ticket operation
 */
@Injectable()
export class ManagedTicketAdminGuard implements CanActivate {
  constructor(
    @Inject('IEventRepository')
    private readonly eventRepository: IEventRepository,
    @Inject('IManagedTicketRepository')
    private readonly ticketRepository: IManagedTicketRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const userId = user.sub || user.id;

    // Extract eventId from various sources
    const eventId = await this.extractEventId(request);

    if (!eventId) {
      throw new ForbiddenException('Event ID not found in request');
    }

    // Verify user is event host
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new ForbiddenException('Event not found');
    }

    // Check if user is host OR in validators list (for scanning)
    const isHost = event.hostId === userId;
    const isValidator = event.validators?.includes(userId) ?? false;

    if (!isHost && !isValidator) {
      throw new ForbiddenException(
        'Only event host or validators can perform this operation',
      );
    }

    return true;
  }

  private async extractEventId(request: any): Promise<string | null> {
    // Direct from request
    let eventId =
      request.body?.eventId ||
      request.params?.eventId ||
      request.query?.eventId;

    if (eventId) return eventId;

    // From ticket
    const ticketId = request.params?.ticketId;
    if (ticketId) {
      const ticket = await this.ticketRepository.findById(ticketId);
      if (ticket) return ticket.eventId;
    }

    // From code
    const code = request.body?.code || request.params?.code;
    if (code) {
      const ticket = await this.ticketRepository.findByCode(code);
      if (ticket) return ticket.eventId;
    }

    return null;
  }
}
