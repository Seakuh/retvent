import { Controller, Post, Delete, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../../application/services/user.service';

@Controller('users')
@UseGuards(AuthGuard())
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('follow/location/:locationId')
  async followLocation(
    @Req() req: any,
    @Param('locationId') locationId: string
  ) {
    return this.userService.followLocation(req.user.id, locationId);
  }

  @Delete('follow/location/:locationId')
  async unfollowLocation(
    @Req() req: any,
    @Param('locationId') locationId: string
  ) {
    return this.userService.unfollowLocation(req.user.id, locationId);
  }

  @Post('follow/artist/:artistId')
  async followArtist(
    @Req() req: any,
    @Param('artistId') artistId: string
  ) {
    return this.userService.followArtist(req.user.id, artistId);
  }

  @Delete('follow/artist/:artistId')
  async unfollowArtist(
    @Req() req: any,
    @Param('artistId') artistId: string
  ) {
    return this.userService.unfollowArtist(req.user.id, artistId);
  }

  @Get('following/locations')
  async getFollowedLocations(@Req() req: any) {
    return this.userService.getFollowedLocations(req.user.id);
  }

  @Get('following/artists')
  async getFollowedArtists(@Req() req: any) {
    return this.userService.getFollowedArtists(req.user.id);
  }
} 