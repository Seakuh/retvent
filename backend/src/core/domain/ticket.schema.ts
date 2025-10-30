// ticket.schema.ts
import { Schema } from 'mongoose';

export const TicketSchema = new Schema({
  eventId: { type: String, required: true },
  email: { type: String, required: true },
  ticketId: { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  hash: { type: String, required: true }, // Security hash for validation
  validatedAt: { type: Date, required: false }, // Timestamp when ticket was scanned at entrance
});
