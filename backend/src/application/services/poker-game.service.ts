import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PokerGame, PokerGameDocument, PlayerAction, PokerGameState } from '../../core/domain/poker-game.schema';
import { ChatGPTService } from '../../infrastructure/services/chatgpt.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PokerGameService {
  constructor(
    @InjectModel(PokerGame.name) private pokerGameModel: Model<PokerGameDocument>,
    private chatGPTService: ChatGPTService,
  ) {}

  async createGame(player1Id: string, player1Name: string, player2Id: string, player2Name: string): Promise<PokerGameDocument> {
    const matchId = uuidv4();

    // Generate initial game state using ChatGPT
    const initialGameState = await this.chatGPTService.generateNewPokerGame(
      player1Id,
      player1Name,
      player2Id,
      player2Name
    );

    // Set match ID
    initialGameState.match.id = matchId;

    const now = new Date();
    const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const pokerGame = new this.pokerGameModel({
      matchId,
      player1Id,
      player2Id,
      gameState: initialGameState,
      isFinished: false,
      lastActionAt: now,
      actionDeadline: deadline,
      actionHistory: ['game_start'],
    });

    return pokerGame.save();
  }

  async getGame(matchId: string): Promise<PokerGameDocument | null> {
    return this.pokerGameModel.findOne({ matchId }).exec();
  }

  async getActiveGamesForPlayer(playerId: string): Promise<PokerGameDocument[]> {
    return this.pokerGameModel.find({
      $or: [{ player1Id: playerId }, { player2Id: playerId }],
      isFinished: false,
    }).exec();
  }

  async processAction(matchId: string, action: PlayerAction): Promise<PokerGameDocument> {
    const game = await this.pokerGameModel.findOne({ matchId });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.isFinished) {
      throw new Error('Game is already finished');
    }

    // Validate that it's the player's turn
    if (game.gameState.action.currentPlayerId !== action.playerId) {
      throw new Error('Not your turn');
    }

    // Process action using ChatGPT
    const updatedGameState = await this.chatGPTService.processPokerAction(
      game.gameState,
      action
    );

    // Update game
    game.gameState = updatedGameState;
    const now = new Date();
    game.lastActionAt = now;
    game.actionDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Reset to 24 hours
    game.actionHistory.push(`${action.playerId}_${action.action}${action.amount ? `_${action.amount}` : ''}`);

    // Check if game is finished
    if (updatedGameState.match.isFinished) {
      game.isFinished = true;
      game.winnerId = updatedGameState.match.winnerId;
    }

    return game.save();
  }

  async getGameHistory(playerId: string, limit: number = 10): Promise<PokerGameDocument[]> {
    return this.pokerGameModel
      .find({
        $or: [{ player1Id: playerId }, { player2Id: playerId }],
        isFinished: true,
      })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .exec();
  }

  async deleteGame(matchId: string): Promise<void> {
    await this.pokerGameModel.deleteOne({ matchId });
  }
}
