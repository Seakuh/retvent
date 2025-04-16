import { Controller, Get, Param, Query } from '@nestjs/common';
import { FeedService } from 'src/application/services/feed.service';
import { Feed } from 'src/core/domain';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('profile-feed/:id')
  async getProfileFeed(
    @Param('id') id: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ): Promise<Feed[]> {
    return this.feedService.getProfileFeed(id, limit, offset);
  }

  @Get('latest/all')
  async getLatestAll(): Promise<Feed[]> {
    return this.feedService.getLatestAll();
  }
}
