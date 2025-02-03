import { Controller, Post, Put, Body, Param, UseGuards, Get } from '@nestjs/common';
import { LocationService } from '../../infrastructure/services/location.service';
import { CreateLocationDto } from '../dtos/create-location.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { OwnerGuard } from '../guards/owner.guard';
import { User as UserDecorator } from '../decorators/user.decorator';
import { User } from '../../core/domain/user';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createLocation(
    @Body() createLocationDto: CreateLocationDto,
    @UserDecorator() user: User
  ) {
    return this.locationService.createLocation(createLocationDto, user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async updateLocation(
    @Param('id') id: string,
    @Body() updateLocationDto: CreateLocationDto,
    @UserDecorator() user: User
  ) {
    return this.locationService.updateLocation(id, updateLocationDto, user.id);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async followLocation(
    @Param('id') id: string,
    @UserDecorator() user: User
  ) {
    return this.locationService.followLocation(id, user.id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async likeLocation(
    @Param('id') id: string,
    @UserDecorator() user: User
  ) {
    return this.locationService.likeLocation(id, user.id);
  }

  @Get('followed-events')
  @UseGuards(JwtAuthGuard)
  async getFollowedLocationsEvents(@UserDecorator() user: User) {
    return this.locationService.getFollowedLocationsEvents(user.id);
  }
} 