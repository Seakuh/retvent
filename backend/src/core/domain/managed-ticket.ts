export enum TicketStatus {
  VALID = 'VALID',
  REDEEMED = 'REDEEMED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum TicketType {
  VIP = 'VIP',
  EARLY_BIRD = 'EARLY_BIRD',
  REGULAR = 'REGULAR',
  FREE = 'FREE',
  CUSTOM = 'CUSTOM',
}

export interface IManagedTicket {
  ticketId: string;
  code: string;

  eventId: string;
  orderId?: string;
  userId?: string;

  ticketType: TicketType | string;
  ticketTypeName?: string;
  price?: number;

  holderEmail: string;
  holderName?: string;
  holderPhone?: string;

  status: TicketStatus;

  redeemedAt?: Date;
  redeemedBy?: string;
  checkInCount: number;
  maxCheckIns: number;

  metadata?: Record<string, any>;
  notes?: string;

  issuedAt: Date;
  validFrom?: Date;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ManagedTicket implements IManagedTicket {
  ticketId: string;
  code: string;

  eventId: string;
  orderId?: string;
  userId?: string;

  ticketType: TicketType | string;
  ticketTypeName?: string;
  price?: number;

  holderEmail: string;
  holderName?: string;
  holderPhone?: string;

  status: TicketStatus;

  redeemedAt?: Date;
  redeemedBy?: string;
  checkInCount: number;
  maxCheckIns: number;

  metadata?: Record<string, any>;
  notes?: string;

  issuedAt: Date;
  validFrom?: Date;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<ManagedTicket>) {
    Object.assign(this, data);
  }
}
