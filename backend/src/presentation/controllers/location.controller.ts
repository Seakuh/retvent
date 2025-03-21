import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LocationService } from '../../application/services/location.service';
import { User } from '../../core/domain/user';
import {
  CreateLocationDto,
  UpdateLocationDto,
} from '../../core/dto/location.dto';
import { User as UserDecorator } from '../decorators/user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { OwnerGuard } from '../guards/owner.guard';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createLocation(
    @Body() createLocationDto: CreateLocationDto,
    @UserDecorator() user: User,
  ) {
    return this.locationService.createLocation(createLocationDto, user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async updateLocation(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @UserDecorator() user: User,
  ) {
    return this.locationService.updateLocation(id, updateLocationDto, user.id);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async followLocation(@Param('id') id: string, @Req() req: any) {
    return this.locationService.followLocation(id, req.user.id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async likeLocation(@Param('id') id: string, @UserDecorator() user: User) {
    return this.locationService.likeLocation(id, user.id);
  }

  @Get('followed-events')
  @UseGuards(JwtAuthGuard)
  async getFollowedLocationsEvents(@UserDecorator() user: User) {
    return this.locationService.getFollowedLocationsEvents(user.id);
  }

  @Get()
  async getAllLocations() {
    return this.locationService.findAll();
  }

  @Get('popular')
  async getPopularLocations() {
    return this.locationService.findPopular();
  }

  @Get(':id')
  async getLocationById(@Param('id') id: string) {
    return this.locationService.findById(id);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  async unfollowLocation(@Param('id') id: string, @Req() req: any) {
    return this.locationService.unfollowLocation(id, req.user.id);
  }
}
