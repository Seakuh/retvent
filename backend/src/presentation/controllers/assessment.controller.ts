import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AssessmentService } from 'src/application/services/assessment.service';
import { User } from 'src/core/domain/user';
import { User as UserDecorator } from '../decorators/user.decorator';
import { CreateAssessmentDto } from '../dtos/create-assessment.dto';
import { CreatePeerAssessmentDto } from '../dtos/create-peer-assessment.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

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
}
