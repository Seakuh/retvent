import { Schema } from 'mongoose';
import { TicketStatus } from '../../core/domain/managed-ticket';

export const ManagedTicketSchema = new Schema(
  {
    // Unique identifiers
    ticketId: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, index: true },

    // Relationships
    eventId: { type: String, required: true, index: true },
    orderId: { type: String, required: false, index: true },
    userId: { type: String, required: false, index: true },

    // Ticket classification
    ticketType: { type: String, required: true },
    ticketTypeName: { type: String, required: false },
    price: { type: Number, required: false, default: 0 },

    // Holder information
    holderEmail: { type: String, required: true },
    holderName: { type: String, required: false },
    holderPhone: { type: String, required: false },

    // Status tracking
    status: {
      type: String,
      required: true,
      enum: Object.values(TicketStatus),
      default: TicketStatus.VALID,
      index: true,
    },

    // Redemption tracking
    redeemedAt: { type: Date, required: false },
    redeemedBy: { type: String, required: false },
    checkInCount: { type: Number, default: 0 },
    maxCheckIns: { type: Number, default: 1 },

    // Metadata
    metadata: { type: Schema.Types.Mixed, required: false },
    notes: { type: String, required: false },

    // Timestamps
    issuedAt: { type: Date, default: Date.now, required: true },
    validFrom: { type: Date, required: false },
    validUntil: { type: Date, required: false },
  },
  {
    timestamps: true,
    collection: 'managed_tickets',
  },
);

// Compound indexes for common queries
ManagedTicketSchema.index({ eventId: 1, status: 1 });
ManagedTicketSchema.index({ userId: 1, eventId: 1 });
