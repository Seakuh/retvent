import { Controller, Get, Param, Query } from '@nestjs/common';
import { FeedService } from 'src/application/services/feed.service';
import { Profile } from 'src/core/domain/profile';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('profile-feed/:id')
  async getProfileFeed(
    @Param('id') id: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ): Promise<Profile[]> {
    return this.feedService.getProfileFeed(id, limit, offset);
  }
}
