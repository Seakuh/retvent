import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FeedService } from 'src/application/services/feed.service';
import { FeedResponse } from '../dtos/feed-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('profile-feed/:id')
  async getProfileFeed(
    @Param('id') id: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ): Promise<FeedResponse[]> {
    return this.feedService.getProfileFeed(id);
  }

  @Get('latest/all')
  async getLatestAll(): Promise<FeedResponse[]> {
    return this.feedService.getLatestAll();
  }

  @Get('byIds')
  async getProfileFeeds(@Query('ids') ids: string): Promise<FeedResponse[]> {
    return this.feedService.getProfilesFeeds(ids.split(','));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteFeed(@Param('id') id: string, @Request() req) {
    return this.feedService.deleteFeed(id, req.user.id);
  }
}
