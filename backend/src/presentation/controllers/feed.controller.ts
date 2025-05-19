import { Controller, Get, Param, Query } from '@nestjs/common';
import { FeedService } from 'src/application/services/feed.service';
import { FeedResponse } from '../dtos/feed-response.dto';
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

  @Get('byId/:id')
  async getFeedById(@Param('id') id: string): Promise<FeedResponse[]> {
    return this.feedService.getFeedById(id);
  }
}
