import { Body, Controller, Get, Post } from '@nestjs/common';
import { FollowService } from 'src/infrastructure/services/follow.service';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('follow')
  async follow(@Body() body: { followerId: string; followingId: string }) {
    return this.followService.follow(body.followerId, body.followingId);
  }

  @Post('unfollow')
  async unfollow(@Body() body: { followerId: string; followingId: string }) {
    return this.followService.unfollow(body.followerId, body.followingId);
  }

  @Get('followers')
  async getFollowers(@Body() body: { userId: string }) {
    return this.followService.getFollowers(body.userId);
  }

  // follow for more
  @Get('following')
  async getFollowing(@Body() body: { userId: string }) {
    return this.followService.getFollowing(body.userId);
  }
}
