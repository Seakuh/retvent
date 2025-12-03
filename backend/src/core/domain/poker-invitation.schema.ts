import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PokerInvitationDocument = PokerInvitation & Document;

@Schema({ timestamps: true })
export class PokerInvitation {
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  receiverId: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'accepted' | 'declined' | 'expired';

  @Prop()
  matchId?: string;

  @Prop({ type: Date })
  expiresAt: Date;

  @Prop({ type: Date })
  respondedAt?: Date;
}

export const PokerInvitationSchema = SchemaFactory.createForClass(PokerInvitation);
