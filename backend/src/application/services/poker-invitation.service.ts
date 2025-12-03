import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PokerInvitation, PokerInvitationDocument } from '../../core/domain/poker-invitation.schema';
import { PokerGameService } from './poker-game.service';

@Injectable()
export class PokerInvitationService {
  constructor(
    @InjectModel(PokerInvitation.name) private invitationModel: Model<PokerInvitationDocument>,
    private pokerGameService: PokerGameService,
  ) {}

  async createInvitation(senderId: string, receiverId: string): Promise<PokerInvitationDocument> {
    // Check if invitation already exists
    const existingInvitation = await this.invitationModel.findOne({
      senderId,
      receiverId,
      status: 'pending',
    });

    if (existingInvitation) {
      throw new Error('Invitation already sent');
    }

    // Create invitation that expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const invitation = new this.invitationModel({
      senderId,
      receiverId,
      status: 'pending',
      expiresAt,
    });

    return invitation.save();
  }

  async getInvitation(invitationId: string): Promise<PokerInvitationDocument | null> {
    return this.invitationModel.findById(invitationId);
  }

  async getPendingInvitationsForUser(userId: string): Promise<PokerInvitationDocument[]> {
    return this.invitationModel.find({
      receiverId: userId,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
  }

  async getSentInvitations(userId: string): Promise<PokerInvitationDocument[]> {
    return this.invitationModel.find({
      senderId: userId,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
  }

  async acceptInvitation(invitationId: string, player1Name: string, player2Name: string): Promise<{ invitation: PokerInvitationDocument, matchId: string }> {
    const invitation = await this.invitationModel.findById(invitationId);

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Invitation already processed');
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      throw new Error('Invitation expired');
    }

    // Create game
    const game = await this.pokerGameService.createGame(
      invitation.senderId,
      player1Name,
      invitation.receiverId,
      player2Name
    );

    // Update invitation
    invitation.status = 'accepted';
    invitation.matchId = game.matchId;
    invitation.respondedAt = new Date();
    await invitation.save();

    return { invitation, matchId: game.matchId };
  }

  async declineInvitation(invitationId: string): Promise<PokerInvitationDocument> {
    const invitation = await this.invitationModel.findById(invitationId);

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Invitation already processed');
    }

    invitation.status = 'declined';
    invitation.respondedAt = new Date();

    return invitation.save();
  }

  async cancelInvitation(invitationId: string, userId: string): Promise<void> {
    const invitation = await this.invitationModel.findById(invitationId);

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.senderId !== userId) {
      throw new Error('Not authorized to cancel this invitation');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Can only cancel pending invitations');
    }

    await this.invitationModel.deleteOne({ _id: invitationId });
  }

  async cleanupExpiredInvitations(): Promise<void> {
    await this.invitationModel.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: new Date() },
      },
      {
        status: 'expired',
      }
    );
  }
}
