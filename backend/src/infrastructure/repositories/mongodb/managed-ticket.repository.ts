import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ulid } from 'ulid';
import {
  ManagedTicket,
  TicketStatus,
} from '../../../core/domain/managed-ticket';
import {
  IManagedTicketRepository,
  CreateManagedTicketDto,
  RedemptionResult,
  TicketStats,
} from '../../../core/repositories/managed-ticket.repository.interface';

@Injectable()
export class MongoManagedTicketRepository
  implements IManagedTicketRepository
{
  constructor(
    @InjectModel('ManagedTicket')
    private ticketModel: Model<ManagedTicket>,
  ) {}

  async create(dto: CreateManagedTicketDto): Promise<ManagedTicket> {
    const ticket = {
      ticketId: ulid(),
      code: ulid(),
      ...dto,
      status: TicketStatus.VALID,
      checkInCount: 0,
      maxCheckIns: dto.maxCheckIns || 1,
      issuedAt: new Date(),
    };

    const created = await this.ticketModel.create(ticket);
    return this.toEntity(created);
  }

  async createBulk(
    dtos: CreateManagedTicketDto[],
  ): Promise<ManagedTicket[]> {
    const tickets = dtos.map((dto) => ({
      ticketId: ulid(),
      code: ulid(),
      ...dto,
      status: TicketStatus.VALID,
      checkInCount: 0,
      maxCheckIns: dto.maxCheckIns || 1,
      issuedAt: new Date(),
    }));

    const created = await this.ticketModel.insertMany(tickets);
    return created.map((doc) => this.toEntity(doc));
  }

  async findById(ticketId: string): Promise<ManagedTicket | null> {
    const ticket = await this.ticketModel.findOne({ ticketId }).exec();
    return ticket ? this.toEntity(ticket) : null;
  }

  async findByCode(code: string): Promise<ManagedTicket | null> {
    const ticket = await this.ticketModel.findOne({ code }).exec();
    return ticket ? this.toEntity(ticket) : null;
  }

  async update(
    ticketId: string,
    updates: Partial<ManagedTicket>,
  ): Promise<ManagedTicket | null> {
    const ticket = await this.ticketModel
      .findOneAndUpdate({ ticketId }, { $set: updates }, { new: true })
      .exec();
    return ticket ? this.toEntity(ticket) : null;
  }

  async delete(ticketId: string): Promise<boolean> {
    const result = await this.ticketModel.deleteOne({ ticketId }).exec();
    return result.deletedCount > 0;
  }

  async findByEventId(
    eventId: string,
    status?: TicketStatus,
  ): Promise<ManagedTicket[]> {
    const query: any = { eventId };
    if (status) {
      query.status = status;
    }

    const tickets = await this.ticketModel.find(query).sort({ issuedAt: -1 }).exec();
    return tickets.map((doc) => this.toEntity(doc));
  }

  async findByOrderId(orderId: string): Promise<ManagedTicket[]> {
    const tickets = await this.ticketModel
      .find({ orderId })
      .sort({ issuedAt: -1 })
      .exec();
    return tickets.map((doc) => this.toEntity(doc));
  }

  async findByUserId(userId: string): Promise<ManagedTicket[]> {
    const tickets = await this.ticketModel
      .find({ userId })
      .sort({ issuedAt: -1 })
      .exec();
    return tickets.map((doc) => this.toEntity(doc));
  }

  async findByEmail(email: string): Promise<ManagedTicket[]> {
    const tickets = await this.ticketModel
      .find({ holderEmail: email })
      .sort({ issuedAt: -1 })
      .exec();
    return tickets.map((doc) => this.toEntity(doc));
  }

  /**
   * CRITICAL: Atomic redemption to prevent race conditions
   * Uses findOneAndUpdate with status condition
   */
  async redeemTicket(
    code: string,
    redeemedBy: string,
  ): Promise<RedemptionResult> {
    // ATOMIC OPERATION: Only update if currently VALID
    const result = await this.ticketModel
      .findOneAndUpdate(
        {
          code,
          status: TicketStatus.VALID,
          $or: [
            { validUntil: { $exists: false } },
            { validUntil: { $gte: new Date() } },
          ],
        },
        {
          $set: {
            status: TicketStatus.REDEEMED,
            redeemedAt: new Date(),
            redeemedBy,
            updatedAt: new Date(),
          },
          $inc: { checkInCount: 1 },
        },
        { new: true },
      )
      .exec();

    if (!result) {
      // Check if already redeemed
      const existing = await this.findByCode(code);
      if (existing?.status === TicketStatus.REDEEMED) {
        return {
          success: false,
          alreadyRedeemed: true,
          ticket: existing,
          message: 'Ticket already redeemed',
        };
      }

      return {
        success: false,
        message: existing ? 'Ticket is not valid' : 'Ticket not found',
      };
    }

    return { success: true, ticket: this.toEntity(result) };
  }

  async cancelTicket(
    ticketId: string,
    reason?: string,
  ): Promise<ManagedTicket | null> {
    const updates: any = {
      status: TicketStatus.CANCELLED,
      updatedAt: new Date(),
    };

    if (reason) {
      updates.notes = reason;
    }

    const ticket = await this.ticketModel
      .findOneAndUpdate({ ticketId }, { $set: updates }, { new: true })
      .exec();

    return ticket ? this.toEntity(ticket) : null;
  }

  async reissueTicket(ticketId: string): Promise<ManagedTicket | null> {
    const oldTicket = await this.findById(ticketId);
    if (!oldTicket) {
      return null;
    }

    // Cancel old ticket
    await this.cancelTicket(ticketId, 'Reissued');

    // Create new ticket with same details but new code
    const newTicket = await this.create({
      eventId: oldTicket.eventId,
      orderId: oldTicket.orderId,
      userId: oldTicket.userId,
      ticketType: oldTicket.ticketType,
      ticketTypeName: oldTicket.ticketTypeName,
      price: oldTicket.price,
      holderEmail: oldTicket.holderEmail,
      holderName: oldTicket.holderName,
      holderPhone: oldTicket.holderPhone,
      maxCheckIns: oldTicket.maxCheckIns,
      validFrom: oldTicket.validFrom,
      validUntil: oldTicket.validUntil,
      metadata: oldTicket.metadata,
    });

    return newTicket;
  }

  async transferTicket(
    ticketId: string,
    newEmail: string,
    newUserId?: string,
  ): Promise<ManagedTicket | null> {
    const updates: any = {
      holderEmail: newEmail,
      updatedAt: new Date(),
    };

    if (newUserId) {
      updates.userId = newUserId;
    }

    const ticket = await this.ticketModel
      .findOneAndUpdate({ ticketId }, { $set: updates }, { new: true })
      .exec();

    return ticket ? this.toEntity(ticket) : null;
  }

  async getTicketStats(eventId: string): Promise<TicketStats> {
    const pipeline = [
      { $match: { eventId } },
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          validTickets: {
            $sum: { $cond: [{ $eq: ['$status', TicketStatus.VALID] }, 1, 0] },
          },
          redeemedTickets: {
            $sum: {
              $cond: [{ $eq: ['$status', TicketStatus.REDEEMED] }, 1, 0],
            },
          },
          cancelledTickets: {
            $sum: {
              $cond: [{ $eq: ['$status', TicketStatus.CANCELLED] }, 1, 0],
            },
          },
          expiredTickets: {
            $sum: { $cond: [{ $eq: ['$status', TicketStatus.EXPIRED] }, 1, 0] },
          },
        },
      },
    ];

    const [result] = await this.ticketModel.aggregate(pipeline);

    // Additional aggregation for byType stats
    const typeStats = await this.ticketModel.aggregate([
      { $match: { eventId } },
      { $group: { _id: '$ticketType', count: { $sum: 1 } } },
    ]);

    const byType = typeStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return {
      eventId,
      totalTickets: result?.totalTickets || 0,
      validTickets: result?.validTickets || 0,
      redeemedTickets: result?.redeemedTickets || 0,
      cancelledTickets: result?.cancelledTickets || 0,
      expiredTickets: result?.expiredTickets || 0,
      checkInRate:
        result && result.totalTickets > 0
          ? (result.redeemedTickets / result.totalTickets) * 100
          : 0,
      byType,
    };
  }

  async getCheckInHistory(
    eventId: string,
    limit: number = 100,
  ): Promise<ManagedTicket[]> {
    const tickets = await this.ticketModel
      .find({ eventId, status: TicketStatus.REDEEMED })
      .sort({ redeemedAt: -1 })
      .limit(limit)
      .exec();

    return tickets.map((doc) => this.toEntity(doc));
  }

  async validateTicketForEvent(
    code: string,
    eventId: string,
  ): Promise<{ valid: boolean; reason?: string; ticket?: ManagedTicket }> {
    const ticket = await this.findByCode(code);

    if (!ticket) {
      return { valid: false, reason: 'Ticket not found' };
    }

    if (ticket.eventId !== eventId) {
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

  private toEntity(doc: any): ManagedTicket {
    return new ManagedTicket({
      ticketId: doc.ticketId,
      code: doc.code,
      eventId: doc.eventId,
      orderId: doc.orderId,
      userId: doc.userId,
      ticketType: doc.ticketType,
      ticketTypeName: doc.ticketTypeName,
      price: doc.price,
      holderEmail: doc.holderEmail,
      holderName: doc.holderName,
      holderPhone: doc.holderPhone,
      status: doc.status,
      redeemedAt: doc.redeemedAt,
      redeemedBy: doc.redeemedBy,
      checkInCount: doc.checkInCount,
      maxCheckIns: doc.maxCheckIns,
      metadata: doc.metadata,
      notes: doc.notes,
      issuedAt: doc.issuedAt,
      validFrom: doc.validFrom,
      validUntil: doc.validUntil,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
