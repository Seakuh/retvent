import { ManagedTicket, TicketStatus } from '../domain/managed-ticket';

export interface CreateManagedTicketDto {
  eventId: string;
  orderId?: string;
  userId?: string;
  ticketType: string;
  ticketTypeName?: string;
  price?: number;
  holderEmail: string;
  holderName?: string;
  holderPhone?: string;
  maxCheckIns?: number;
  validFrom?: Date;
  validUntil?: Date;
  metadata?: Record<string, any>;
}

export interface RedemptionResult {
  success: boolean;
  ticket?: ManagedTicket;
  message?: string;
  alreadyRedeemed?: boolean;
}

export interface TicketStats {
  eventId: string;
  totalTickets: number;
  validTickets: number;
  redeemedTickets: number;
  cancelledTickets: number;
  expiredTickets: number;
  checkInRate: number;
  byType: Record<string, number>;
}

export interface IManagedTicketRepository {
  // Core CRUD
  create(dto: CreateManagedTicketDto): Promise<ManagedTicket>;
  createBulk(dtos: CreateManagedTicketDto[]): Promise<ManagedTicket[]>;
  findById(ticketId: string): Promise<ManagedTicket | null>;
  findByCode(code: string): Promise<ManagedTicket | null>;
  update(
    ticketId: string,
    updates: Partial<ManagedTicket>,
  ): Promise<ManagedTicket | null>;
  delete(ticketId: string): Promise<boolean>;

  // Query operations
  findByEventId(
    eventId: string,
    status?: TicketStatus,
  ): Promise<ManagedTicket[]>;
  findByOrderId(orderId: string): Promise<ManagedTicket[]>;
  findByUserId(userId: string): Promise<ManagedTicket[]>;
  findByEmail(email: string): Promise<ManagedTicket[]>;

  // Redemption operations (atomic)
  redeemTicket(code: string, redeemedBy: string): Promise<RedemptionResult>;

  // Admin operations
  cancelTicket(
    ticketId: string,
    reason?: string,
  ): Promise<ManagedTicket | null>;
  reissueTicket(ticketId: string): Promise<ManagedTicket | null>;
  transferTicket(
    ticketId: string,
    newEmail: string,
    newUserId?: string,
  ): Promise<ManagedTicket | null>;

  // Reporting
  getTicketStats(eventId: string): Promise<TicketStats>;
  getCheckInHistory(
    eventId: string,
    limit?: number,
  ): Promise<ManagedTicket[]>;

  // Validation
  validateTicketForEvent(
    code: string,
    eventId: string,
  ): Promise<{
    valid: boolean;
    reason?: string;
    ticket?: ManagedTicket;
  }>;
}
