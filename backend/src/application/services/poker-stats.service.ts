import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PokerStats, PokerStatsDocument, StatsSummary, DailyActivity } from '../../core/domain/poker-stats.schema';

@Injectable()
export class PokerStatsService {
  constructor(
    @InjectModel(PokerStats.name) private pokerStatsModel: Model<PokerStatsDocument>,
  ) {}

  async getOrCreateStats(userId: string): Promise<PokerStatsDocument> {
    let stats = await this.pokerStatsModel.findOne({ userId });

    if (!stats) {
      stats = new this.pokerStatsModel({ userId });
      await stats.save();
    }

    return stats;
  }

  async updateAfterGame(userId: string, won: boolean, xpEarned: number): Promise<PokerStatsDocument> {
    const stats = await this.getOrCreateStats(userId);

    // Update total stats
    stats.gamesPlayedTotal += 1;

    if (won) {
      stats.winsTotal += 1;
      stats.currentWinStreak += 1;
      stats.currentLoseStreak = 0;
      stats.longestWinStreak = Math.max(stats.longestWinStreak, stats.currentWinStreak);
    } else {
      stats.lossesTotal += 1;
      stats.currentLoseStreak += 1;
      stats.currentWinStreak = 0;
      stats.longestLoseStreak = Math.max(stats.longestLoseStreak, stats.currentLoseStreak);
    }

    // Calculate win rate
    stats.winRate = (stats.winsTotal / stats.gamesPlayedTotal) * 100;

    // Update XP
    stats.xpSystem.totalXp += xpEarned;
    stats.xpSystem.xpEarnedThisGame = xpEarned;
    stats.xpSystem.level = this.calculateLevel(stats.xpSystem.totalXp);
    stats.xpSystem.progressToNextLevel = this.calculateProgressToNextLevel(stats.xpSystem.totalXp);

    // Update daily activity
    const today = new Date().toISOString().split('T')[0];
    let todayActivity = stats.dailyActivity.find(a => a.date === today);

    if (!todayActivity) {
      todayActivity = {
        date: today,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        xpEarned: 0,
      };
      stats.dailyActivity.push(todayActivity);
    }

    todayActivity.gamesPlayed += 1;
    todayActivity.xpEarned += xpEarned;
    if (won) {
      todayActivity.wins += 1;
    } else {
      todayActivity.losses += 1;
    }

    // Update weekly and daily counters
    stats.gamesToday = todayActivity.gamesPlayed;
    stats.gamesThisWeek = this.calculateGamesThisWeek(stats.dailyActivity);
    stats.averageGamesPerDay = this.calculateAverageGamesPerDay(stats.dailyActivity);

    return stats.save();
  }

  async getStatsSummary(userId: string): Promise<StatsSummary> {
    const stats = await this.getOrCreateStats(userId);

    return {
      gamesToday: stats.gamesToday,
      gamesThisWeek: stats.gamesThisWeek,
      averageGamesPerDay: stats.averageGamesPerDay,
      winRate: stats.winRate,
      currentStreak: stats.currentWinStreak > 0 ? stats.currentWinStreak : -stats.currentLoseStreak,
      xp: {
        totalXp: stats.xpSystem.totalXp,
        level: stats.xpSystem.level,
        progressToNextLevel: stats.xpSystem.progressToNextLevel,
      },
    };
  }

  private calculateLevel(totalXp: number): number {
    // Level calculation: Level = floor(sqrt(totalXp / 100))
    // This means: Level 1 = 0-99 XP, Level 2 = 100-399 XP, Level 3 = 400-899 XP, etc.
    return Math.floor(Math.sqrt(totalXp / 100)) + 1;
  }

  private calculateProgressToNextLevel(totalXp: number): number {
    const currentLevel = this.calculateLevel(totalXp);
    const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
    const xpForNextLevel = Math.pow(currentLevel, 2) * 100;
    const xpInCurrentLevel = totalXp - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;

    return (xpInCurrentLevel / xpNeededForNextLevel) * 100;
  }

  private calculateGamesThisWeek(dailyActivity: DailyActivity[]): number {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    return dailyActivity
      .filter(a => a.date >= weekAgoStr)
      .reduce((sum, a) => sum + a.gamesPlayed, 0);
  }

  private calculateAverageGamesPerDay(dailyActivity: DailyActivity[]): number {
    if (dailyActivity.length === 0) return 0;

    const totalGames = dailyActivity.reduce((sum, a) => sum + a.gamesPlayed, 0);
    return totalGames / dailyActivity.length;
  }

  calculateXpForGame(won: boolean, currentStreak: number): number {
    let baseXp = won ? 50 : 20;
    let streakBonus = 0;

    if (won && currentStreak > 1) {
      streakBonus = Math.min(currentStreak * 10, 50); // Max 50 bonus
    }

    return baseXp + streakBonus;
  }
}
