import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommunityService } from '../../application/services/community.service';
import { CreateCommunityDto } from '../dtos/create-community.dto';
import { UpdateCommunityDto } from '../dtos/update-community.dto';
import { CommunityHostGuard } from '../guards/community-host.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('communities')
  async getCommunities() {
    return this.communityService.getCommunities();
  }

  @Get(':communityId')
  async getCommunity(@Param('communityId') communityId: string) {
    const community = await this.communityService.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return community;
  }

  @Post('create-community')
  @UseGuards(JwtAuthGuard)
  async createCommunity(@Body() body: CreateCommunityDto, @Req() req) {
    console.log('Creating community named', body.name);
    return this.communityService.createCommunity(body, req.user.sub);
  }

  @Post('join-community')
  @UseGuards(JwtAuthGuard)
  async joinCommunity(@Body() body: { communityId: string }, @Req() req) {
    return this.communityService.joinCommunity(
      { communityId: body.communityId },
      req.user.sub,
    );
  }

  @Post('add-moderator')
  @UseGuards(CommunityHostGuard)
  async addModerator(@Body() body: { communityId: string; userId: string }) {
    return this.communityService.addModerator(body.communityId, body.userId);
  }

  @Post('update-community')
  @UseGuards(CommunityHostGuard)
  async updateCommunity(@Body() body: UpdateCommunityDto) {
    console.log('Updating community', body);
    return this.communityService.updateCommunity(body.communityId, body);
  }

  @Get('members/:communityId')
  async getMembers(@Param('communityId') communityId: string) {
    const community = await this.communityService.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return community.members;
  }

  @Delete(':communityId')
  @UseGuards(CommunityHostGuard)
  async deleteCommunity(@Param('communityId') communityId: string, @Req() req) {
    return this.communityService.deleteCommunity(communityId, req.user.sub);
  }
}
