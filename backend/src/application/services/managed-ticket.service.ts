import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  IManagedTicketRepository,
  CreateManagedTicketDto,
  RedemptionResult,
  TicketStats,
} from '../../core/repositories/managed-ticket.repository.interface';
import {
  ManagedTicket,
  TicketStatus,
} from '../../core/domain/managed-ticket';
import { IEventRepository } from '../../core/repositories/event.repository.interface';

export interface IssueTicketsDto {
  eventId: string;
  orderId?: string;
  userId?: string;
  tickets: Array<{
    ticketType: string;
    ticketTypeName?: string;
    price?: number;
    holderEmail: string;
    holderName?: string;
    holderPhone?: string;
    maxCheckIns?: number;
    metadata?: Record<string, any>;
  }>;
  validFrom?: Date;
  validUntil?: Date;
}

@Injectable()
export class ManagedTicketService {
  constructor(
    @Inject('IManagedTicketRepository')
    private readonly ticketRepository: IManagedTicketRepository,
    @Inject('IEventRepository')
    private readonly eventRepository: IEventRepository,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * Issue tickets for an order
   * Generates unique codes and creates tickets in bulk
   */
  async issueTickets(dto: IssueTicketsDto): Promise<ManagedTicket[]> {
    // Validate event exists
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new NotFoundException(`Event ${dto.eventId} not found`);
    }

    // Create tickets
    const ticketDtos: CreateManagedTicketDto[] = dto.tickets.map((t) => ({
      eventId: dto.eventId,
      orderId: dto.orderId,
      userId: dto.userId,
      ticketType: t.ticketType,
      ticketTypeName: t.ticketTypeName,
      price: t.price,
      holderEmail: t.holderEmail,
      holderName: t.holderName,
      holderPhone: t.holderPhone,
      maxCheckIns: t.maxCheckIns || 1,
      validFrom: dto.validFrom,
      validUntil: dto.validUntil,
      metadata: t.metadata,
    }));

    const tickets = await this.ticketRepository.createBulk(ticketDtos);

    // Send confirmation emails (async, don't wait)
    this.sendTicketEmails(tickets, event).catch((err) => {
      console.error('Failed to send ticket emails:', err);
    });

    return tickets;
  }

  /**
   * Validate ticket for redemption (without redeeming)
   * Used for pre-check at entrance
   */
  async validateTicket(
    code: string,
    eventId?: string,
  ): Promise<{ valid: boolean; reason?: string; ticket?: ManagedTicket }> {
    const ticket = await this.ticketRepository.findByCode(code);

    if (!ticket) {
      return { valid: false, reason: 'Ticket not found' };
    }

    if (eventId && ticket.eventId !== eventId) {
      return {
        valid: false,
        reason: 'Ticket not valid for this event',
        ticket,
      };
    }

    if (ticket.status !== TicketStatus.VALID) {
      return {
        valid: false,
        reason: `Ticket is ${ticket.status.toLowerCase()}`,
        ticket,
      };
    }

    // Check validity period
    const now = new Date();
    if (ticket.validFrom && now < ticket.validFrom) {
      return { valid: false, reason: 'Ticket not yet valid', ticket };
    }
    if (ticket.validUntil && now > ticket.validUntil) {
      return { valid: false, reason: 'Ticket expired', ticket };
    }

    return { valid: true, ticket };
  }

  /**
   * Redeem ticket at entrance (atomic operation)
   */
  async redeemTicket(
    code: string,
    redeemedBy: string,
    eventId?: string,
  ): Promise<RedemptionResult> {
    // Pre-validate
    const validation = await this.validateTicket(code, eventId);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.reason,
        ticket: validation.ticket,
      };
    }

    // Atomic redemption
    const result = await this.ticketRepository.redeemTicket(code, redeemedBy);

    if (result.success) {
      console.log(
        `Ticket ${code} redeemed by ${redeemedBy} at ${new Date().toISOString()}`,
      );
    }

    return result;
  }

  /**
   * Cancel ticket (admin operation)
   */
  async cancelTicket(
    ticketId: string,
    reason?: string,
  ): Promise<ManagedTicket> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === TicketStatus.REDEEMED) {
      throw new BadRequestException('Cannot cancel redeemed ticket');
    }

    const cancelled = await this.ticketRepository.cancelTicket(
      ticketId,
      reason,
    );

    // Send cancellation email (async, don't wait)
    if (cancelled) {
      this.sendCancellationEmail(cancelled).catch((err) => {
        console.error('Failed to send cancellation email:', err);
      });
    }

    return cancelled;
  }

  /**
   * Reissue ticket (creates new ticket, cancels old)
   */
  async reissueTicket(ticketId: string): Promise<ManagedTicket> {
    const oldTicket = await this.ticketRepository.findById(ticketId);
    if (!oldTicket) {
      throw new NotFoundException('Ticket not found');
    }

    const newTicket = await this.ticketRepository.reissueTicket(ticketId);

    // Send new ticket email (async, don't wait)
    if (newTicket) {
      const event = await this.eventRepository.findById(newTicket.eventId);
      if (event) {
        this.sendTicketEmails([newTicket], event).catch((err) => {
          console.error('Failed to send reissued ticket email:', err);
        });
      }
    }

    return newTicket;
  }

  /**
   * Transfer ticket to new owner
   */
  async transferTicket(
    ticketId: string,
    newEmail: string,
    newUserId?: string,
  ): Promise<ManagedTicket> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === TicketStatus.REDEEMED) {
      throw new BadRequestException('Cannot transfer redeemed ticket');
    }

    const transferred = await this.ticketRepository.transferTicket(
      ticketId,
      newEmail,
      newUserId,
    );

    // Send transfer email (async, don't wait)
    if (transferred) {
      const event = await this.eventRepository.findById(transferred.eventId);
      if (event) {
        this.sendTicketEmails([transferred], event).catch((err) => {
          console.error('Failed to send transferred ticket email:', err);
        });
      }
    }

    return transferred;
  }

  /**
   * Get ticket by ID
   */
  async getTicketById(ticketId: string): Promise<ManagedTicket> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  /**
   * Get check-in statistics for event
   */
  async getEventStats(eventId: string): Promise<TicketStats> {
    return this.ticketRepository.getTicketStats(eventId);
  }

  /**
   * Get all tickets for event (admin)
   */
  async getEventTickets(
    eventId: string,
    status?: TicketStatus,
  ): Promise<ManagedTicket[]> {
    return this.ticketRepository.findByEventId(eventId, status);
  }

  /**
   * Get tickets by order
   */
  async getTicketsByOrder(orderId: string): Promise<ManagedTicket[]> {
    return this.ticketRepository.findByOrderId(orderId);
  }

  /**
   * Get user's tickets
   */
  async getUserTickets(userId: string): Promise<ManagedTicket[]> {
    return this.ticketRepository.findByUserId(userId);
  }

  /**
   * Get check-in history
   */
  async getCheckInHistory(
    eventId: string,
    limit?: number,
  ): Promise<ManagedTicket[]> {
    return this.ticketRepository.getCheckInHistory(eventId, limit);
  }

  // Private helper methods for email sending
  private async sendTicketEmails(
    tickets: ManagedTicket[],
    event: any,
  ): Promise<void> {
    // Group tickets by email
    const ticketsByEmail = tickets.reduce((acc, ticket) => {
      if (!acc[ticket.holderEmail]) {
        acc[ticket.holderEmail] = [];
      }
      acc[ticket.holderEmail].push(ticket);
      return acc;
    }, {} as Record<string, ManagedTicket[]>);

    // Send one email per recipient with all their tickets
    for (const [email, userTickets] of Object.entries(ticketsByEmail)) {
      await this.mailerService.sendMail({
        to: email,
        subject: `Your tickets for ${event.title}`,
        html: this.generateTicketEmailHtml(userTickets, event),
      });
    }
  }

  private generateTicketEmailHtml(
    tickets: ManagedTicket[],
    event: any,
  ): string {
    const ticketsHtml = tickets
      .map(
        (t) => `
      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0;">${t.ticketTypeName || t.ticketType}</h3>
        <p style="margin: 5px 0;"><strong>Ticket Code:</strong> ${t.code}</p>
        <p style="margin: 5px 0;"><strong>Holder:</strong> ${t.holderName || t.holderEmail}</p>
        ${t.price ? `<p style="margin: 5px 0;"><strong>Price:</strong> ${t.price}</p>` : ''}
        <div style="margin-top: 15px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?data=${t.code}&size=200x200" alt="QR Code" style="display: block;" />
        </div>
      </div>
    `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333;">${event.title}</h1>
        <p style="color: #666;">Thank you for your ticket purchase!</p>

        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
          <p style="margin: 5px 0;"><strong>Event:</strong> ${event.title}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${event.startTime || 'TBA'}</p>
          ${event.city ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${event.city}</p>` : ''}
        </div>

        <h2 style="color: #333;">Your Tickets</h2>
        ${ticketsHtml}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>Please present the QR code at the event entrance for check-in.</p>
          <p>Keep this email safe - you'll need it to access the event.</p>
        </div>
      </body>
      </html>
    `;
  }

  private async sendCancellationEmail(ticket: ManagedTicket): Promise<void> {
    await this.mailerService.sendMail({
      to: ticket.holderEmail,
      subject: `Ticket Cancelled`,
      html: `
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Ticket Cancelled</h1>
          <p>Your ticket (${ticket.code}) has been cancelled.</p>
          ${ticket.notes ? `<p><strong>Reason:</strong> ${ticket.notes}</p>` : ''}
          <p>If you have any questions, please contact the event organizer.</p>
        </body>
        </html>
      `,
    });
  }
}
