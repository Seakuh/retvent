import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommunityService } from '../../application/services/community.service';
import { CreateCommunityDto } from '../dtos/create-community.dto';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('communities')
  async getCommunities() {
    return this.communityService.getCommunities();
  }

  @Post('create-community')
  async createCommunity(@Body() body: CreateCommunityDto) {
    return this.communityService.createCommunity(body);
  }
}
