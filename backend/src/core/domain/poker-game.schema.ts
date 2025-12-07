import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PokerGameDocument = PokerGame & Document;

@Schema({ timestamps: true })
export class PokerGame {
  @Prop({ required: true })
  matchId: string;

  @Prop({ required: true })
  player1Id: string;

  @Prop({ required: true })
  player2Id: string;

  @Prop({ type: Object, required: true })
  gameState: PokerGameState;

  @Prop({ default: false })
  isFinished: boolean;

  @Prop()
  winnerId?: string;

  @Prop({ type: Date })
  lastActionAt: Date;

  @Prop({ type: Date })
  actionDeadline: Date;

  @Prop({ type: [String], default: [] })
  actionHistory: string[];
}

export const PokerGameSchema = SchemaFactory.createForClass(PokerGame);

// Game State Interfaces
export interface PokerGameState {
  match: MatchState;
  players: PlayerState[];
  table: TableState;
  action: ActionState;
}

export interface MatchState {
  id: string;
  blindLevel: string;
  isFinished: boolean;
  winnerId: string | null;
}

export interface PlayerState {
  id: string;
  name: string;
  stack: number;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  holeCards: string[];
  hasFolded: boolean;
}

export interface TableState {
  pot: number;
  communityCards: string[];
  street: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  lastAction: string;
}

export interface ActionState {
  currentPlayerId: string;
  allowedActions: string[];
  minBet: number;
  maxBet: number;
}

// Player Action Interface
export interface PlayerAction {
  playerId: string;
  action: 'FOLD' | 'CHECK' | 'CALL' | 'BET' | 'RAISE' | 'ALL_IN';
  amount?: number;
}
