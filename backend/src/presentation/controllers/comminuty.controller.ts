import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CommunityService } from '../../application/services/community.service';
import { CreateCommunityDto } from '../dtos/create-community.dto';
import { JoinCommunityDto } from '../dtos/join-community.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('communities')
  async getCommunities() {
    return this.communityService.getCommunities();
  }

  @Post('create-community')
  @UseGuards(JwtAuthGuard)
  async createCommunity(@Body() body: CreateCommunityDto, @Req() req) {
    console.log('Creating community named', body.name);
    return this.communityService.createCommunity(body, req.user.sub);
  }

  @Post('join-community')
  @UseGuards(JwtAuthGuard)
  async joinCommunity(@Body() body: JoinCommunityDto, @Req() req) {
    return this.communityService.joinCommunity(body, req.user.sub);
  }
}
