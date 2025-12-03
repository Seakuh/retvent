import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { AssessmentService } from 'src/application/services/assessment.service';
import { PokerGameService } from 'src/application/services/poker-game.service';
import { PokerStatsService } from 'src/application/services/poker-stats.service';
import { PokerInvitationService } from 'src/application/services/poker-invitation.service';
import { User } from 'src/core/domain/user';
import { User as UserDecorator } from '../decorators/user.decorator';
import { CreateAssessmentDto } from '../dtos/create-assessment.dto';
import { CreatePeerAssessmentDto } from '../dtos/create-peer-assessment.dto';
import { PlayerActionDto, CreateInvitationDto, AcceptInvitationDto, DeclineInvitationDto } from '../dtos/poker-game.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('assessment')
export class AssessmentController {
  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly pokerGameService: PokerGameService,
    private readonly pokerStatsService: PokerStatsService,
    private readonly pokerInvitationService: PokerInvitationService,
  ) {}

  @Post('self')
  @UseGuards(JwtAuthGuard)
  async createAssessment(
    @Body() createAssessmentDto: CreateAssessmentDto,
    @UserDecorator() user: User,
  ) {
    return this.assessmentService.createAssessment(
      createAssessmentDto,
      user.sub,
    );
  }

  @Post('peer')
  @UseGuards(JwtAuthGuard)
  async createPeerAssessment(
    @Body() createPeerAssessmentDto: CreatePeerAssessmentDto,
    @UserDecorator() user: User,
  ) {
    return this.assessmentService.createPeerAssessment(
      createPeerAssessmentDto,
      user.sub,
    );
  }

  @Get('matrix')
  @UseGuards(JwtAuthGuard)
  async getAssessmentMatrix(@UserDecorator() user: User) {
    return this.assessmentService.getAssessmentMatrix(user.sub);
  }

  @Get('match')
  @UseGuards(JwtAuthGuard)
  async matchPlayers(
    @UserDecorator() user: User,
    @Query('playStyle') playStyle?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.assessmentService.matchPlayersByAssessment(
      user.sub,
      playStyle,
      limitNum,
    );
  }

  @Get('similar')
  @UseGuards(JwtAuthGuard)
  async findSimilarPlayers(
    @UserDecorator() user: User,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.assessmentService.findSimilarPlayers(user.sub, limitNum);
  }

  @Get('find-matches')
  @UseGuards(JwtAuthGuard)
  async findMatches(
    @UserDecorator() user: User,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.assessmentService.findMatches(user.sub, limitNum);
  }

  // ============================================
  // POKER GAME ENDPOINTS
  // ============================================

  @Post('poker/invitation')
  @UseGuards(JwtAuthGuard)
  async createPokerInvitation(
    @Body() createInvitationDto: CreateInvitationDto,
    @UserDecorator() user: User,
  ) {
    const invitation = await this.pokerInvitationService.createInvitation(
      user.sub,
      createInvitationDto.receiverId,
    );

    // TODO: Send push notification to receiver
    // await this.notificationService.sendPokerInvitation(invitation);

    return invitation;
  }

  @Post('poker/invitation/accept')
  @UseGuards(JwtAuthGuard)
  async acceptPokerInvitation(
    @Body() acceptInvitationDto: AcceptInvitationDto,
    @UserDecorator() user: User,
  ) {
    // TODO: Get player names from profile service
    const player1Name = 'Player1'; // Replace with actual name lookup
    const player2Name = user.username || 'Player2';

    const result = await this.pokerInvitationService.acceptInvitation(
      acceptInvitationDto.invitationId,
      player1Name,
      player2Name,
    );

    return result;
  }

  @Post('poker/invitation/decline')
  @UseGuards(JwtAuthGuard)
  async declinePokerInvitation(
    @Body() declineInvitationDto: DeclineInvitationDto,
    @UserDecorator() user: User,
  ) {
    return this.pokerInvitationService.declineInvitation(
      declineInvitationDto.invitationId,
    );
  }

  @Delete('poker/invitation/:invitationId')
  @UseGuards(JwtAuthGuard)
  async cancelPokerInvitation(
    @Param('invitationId') invitationId: string,
    @UserDecorator() user: User,
  ) {
    await this.pokerInvitationService.cancelInvitation(invitationId, user.sub);
    return { success: true };
  }

  @Get('poker/invitations/pending')
  @UseGuards(JwtAuthGuard)
  async getPendingInvitations(@UserDecorator() user: User) {
    return this.pokerInvitationService.getPendingInvitationsForUser(user.sub);
  }

  @Get('poker/invitations/sent')
  @UseGuards(JwtAuthGuard)
  async getSentInvitations(@UserDecorator() user: User) {
    return this.pokerInvitationService.getSentInvitations(user.sub);
  }

  @Get('poker/game/:matchId')
  @UseGuards(JwtAuthGuard)
  async getPokerGame(
    @Param('matchId') matchId: string,
    @UserDecorator() user: User,
  ) {
    const game = await this.pokerGameService.getGame(matchId);

    if (!game) {
      throw new Error('Game not found');
    }

    // Check if user is part of the game
    if (game.player1Id !== user.sub && game.player2Id !== user.sub) {
      throw new Error('Not authorized to view this game');
    }

    return game;
  }

  @Get('poker/games/active')
  @UseGuards(JwtAuthGuard)
  async getActiveGames(@UserDecorator() user: User) {
    return this.pokerGameService.getActiveGamesForPlayer(user.sub);
  }

  @Get('poker/games/history')
  @UseGuards(JwtAuthGuard)
  async getGameHistory(
    @UserDecorator() user: User,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.pokerGameService.getGameHistory(user.sub, limitNum);
  }

  @Post('poker/action')
  @UseGuards(JwtAuthGuard)
  async processPokerAction(
    @Body() playerActionDto: PlayerActionDto,
    @UserDecorator() user: User,
  ) {
    const game = await this.pokerGameService.processAction(
      playerActionDto.matchId,
      {
        playerId: user.sub,
        action: playerActionDto.action,
        amount: playerActionDto.amount,
      },
    );

    // If game is finished, update stats
    if (game.isFinished && game.winnerId) {
      const won = game.winnerId === user.sub;
      const currentStreak = won ?
        (await this.pokerStatsService.getOrCreateStats(user.sub)).currentWinStreak :
        (await this.pokerStatsService.getOrCreateStats(user.sub)).currentLoseStreak;

      const xpEarned = this.pokerStatsService.calculateXpForGame(won, currentStreak);
      await this.pokerStatsService.updateAfterGame(user.sub, won, xpEarned);

      // Update opponent's stats
      const opponentId = game.player1Id === user.sub ? game.player2Id : game.player1Id;
      const opponentWon = !won;
      const opponentStreak = opponentWon ?
        (await this.pokerStatsService.getOrCreateStats(opponentId)).currentWinStreak :
        (await this.pokerStatsService.getOrCreateStats(opponentId)).currentLoseStreak;

      const opponentXp = this.pokerStatsService.calculateXpForGame(opponentWon, opponentStreak);
      await this.pokerStatsService.updateAfterGame(opponentId, opponentWon, opponentXp);
    }

    return game;
  }

  @Get('poker/stats')
  @UseGuards(JwtAuthGuard)
  async getPokerStats(@UserDecorator() user: User) {
    return this.pokerStatsService.getOrCreateStats(user.sub);
  }

  @Get('poker/stats/summary')
  @UseGuards(JwtAuthGuard)
  async getPokerStatsSummary(@UserDecorator() user: User) {
    return this.pokerStatsService.getStatsSummary(user.sub);
  }
}
