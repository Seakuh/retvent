import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PokerStatsDocument = PokerStats & Document;

@Schema({ timestamps: true })
export class PokerStats {
  @Prop({ required: true, unique: true })
  userId: string;

  // Total Statistics
  @Prop({ default: 0 })
  gamesPlayedTotal: number;

  @Prop({ default: 0 })
  winsTotal: number;

  @Prop({ default: 0 })
  lossesTotal: number;

  @Prop({ default: 0 })
  winRate: number;

  // Streaks
  @Prop({ default: 0 })
  currentWinStreak: number;

  @Prop({ default: 0 })
  currentLoseStreak: number;

  @Prop({ default: 0 })
  longestWinStreak: number;

  @Prop({ default: 0 })
  longestLoseStreak: number;

  // Daily Activity
  @Prop({ type: [Object], default: [] })
  dailyActivity: DailyActivity[];

  @Prop({ default: 0 })
  averageGamesPerDay: number;

  // XP System
  @Prop({ type: Object, default: { totalXp: 0, level: 1, xpEarnedThisGame: 0, progressToNextLevel: 0 } })
  xpSystem: XPSystem;

  // Weekly Stats
  @Prop({ default: 0 })
  gamesThisWeek: number;

  @Prop({ default: 0 })
  gamesToday: number;
}

export const PokerStatsSchema = SchemaFactory.createForClass(PokerStats);

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  gamesPlayed: number;
  wins: number;
  losses: number;
  xpEarned: number;
}

export interface XPSystem {
  totalXp: number;
  level: number;
  xpEarnedThisGame: number;
  progressToNextLevel: number; // 0-100
}

export interface StatsSummary {
  gamesToday: number;
  gamesThisWeek: number;
  averageGamesPerDay: number;
  winRate: number;
  currentStreak: number;
  xp: {
    totalXp: number;
    level: number;
    progressToNextLevel: number;
  };
}
