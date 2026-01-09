import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommunityService } from '../../application/services/community.service';
import { EventService } from '../../application/services/event.service';
import { CreateCommunityDto } from '../dtos/create-community.dto';
import { UpdateCommunityDto } from '../dtos/update-community.dto';
import { CommunityHostGuard } from '../guards/community-host.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CommunityEventGuard } from '../guards/community-event.guard';

@Controller('community')
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly eventService: EventService,
  ) {}

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

  @Get('members/v2/:communityId')
  async getMembersV2(@Param('communityId') communityId: string) {
    return this.communityService.getMembers(communityId);
  }

  @Post(':communityId/events')
  @UseGuards(JwtAuthGuard, CommunityEventGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createCommunityEvent(
    @Param('communityId') communityId: string,
    @Body() body: any,
    @UploadedFile() image?: Express.Multer.File,
    @Req() req?,
  ) {
    // Parse data if passed as JSON string
    let eventData = body.data || body;
    if (typeof eventData === 'string') {
      eventData = JSON.parse(eventData);
    }

    // Set communityId explicitly from URL parameter
    eventData.communityId = communityId;

    return this.eventService.createEventFull(eventData, req.user.sub, image);
  }

  @Delete(':communityId')
  @UseGuards(CommunityHostGuard)
  async deleteCommunity(@Param('communityId') communityId: string, @Req() req) {
    return this.communityService.deleteCommunity(communityId, req.user.sub);
  }

  /**
   * Pinnt ein Event an die Community-Posts (nur für Admins)
   * POST /community/:communityId/pin-event
   */
  @Post(':communityId/pin-event')
  @UseGuards(JwtAuthGuard)
  async pinEventToCommunity(
    @Param('communityId') communityId: string,
    @Body() body: { eventId: string },
    @Req() req,
  ) {
    return this.communityService.pinEventToCommunity(
      communityId,
      body.eventId,
      req.user.sub,
    );
  }

  /**
   * Entfernt ein Event aus den gepinnten Events einer Community (nur für Admins)
   * DELETE /community/:communityId/pin-event/:eventId
   */
  @Delete(':communityId/pin-event/:eventId')
  @UseGuards(JwtAuthGuard)
  async unpinEventFromCommunity(
    @Param('communityId') communityId: string,
    @Param('eventId') eventId: string,
    @Req() req,
  ) {
    return this.communityService.unpinEventFromCommunity(
      communityId,
      eventId,
      req.user.sub,
    );
  }

  /**
   * Gibt alle gepinnten Events einer Community zurück
   * GET /community/:communityId/pinned-events
   */
  @Get(':communityId/pinned-events')
  async getPinnedEvents(@Param('communityId') communityId: string) {
    return this.communityService.getPinnedEvents(communityId);
  }

  /**
   * Gibt die Dashboard-Daten für eine Community zurück
   * Enthält gepinnte Events und neueste Posts (beide optional)
   * GET /community/:communityId/dashboard
   */
  @Get(':communityId/dashboard')
  async getCommunityDashboard(
    @Param('communityId') communityId: string,
    @Query('includePinnedEvents') includePinnedEvents?: string,
    @Query('includeLatestPosts') includeLatestPosts?: string,
    @Query('postsOffset') postsOffset?: number,
    @Query('postsLimit') postsLimit?: number,
  ) {
    return this.communityService.getCommunityDashboard(communityId, {
      includePinnedEvents:
        includePinnedEvents === undefined
          ? true
          : includePinnedEvents === 'true',
      includeLatestPosts:
        includeLatestPosts === undefined
          ? true
          : includeLatestPosts === 'true',
      postsOffset: postsOffset || 0,
      postsLimit: postsLimit || 20,
    });
  }
}
