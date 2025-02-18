import { Controller, Request, Post, Body, Get, Query, UseInterceptors, UploadedFile, BadRequestException, Param, UseGuards, UnauthorizedException } from '@nestjs/common';
import { EventService } from '../../application/services/event.service';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import { Event } from '../../core/domain/event';
import { CreateEventDto } from '../dtos/create-event.dto';
import { User as UserDecorator } from '../decorators/user.decorator';
import { User } from '../../core/domain/user';
import { EventMapper } from '../../application/mappers/event.mapper';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('events')
export class EventController {
  constructor(
    // private readonly meetupService: MeetupService,
    private readonly eventService: EventService,
    private readonly eventMapper: EventMapper
  ) { }

  @Get('search/plattforms')

  async searchEventPlattforms(@Query('query') query: string, @Query('location') location?: string): Promise<any> {
    const params = { query, location };
    console.info('Searching for events with params:', params);
    // const meetupEvents = await this.meetupService.searchEvents(params);
    // const chatGPTEvents = await this.chatGPTService.searchEvents(params);
    // return [...meetupEvents, ...chatGPTEvents];
    // return [...meetupEvents];

  }

  @Post('upload/event-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadEventImage(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: { uploadLat?: number; uploadLon?: number },
  ) {
    return this.eventService.processEventImageUpload(image, body.uploadLat, body.uploadLon);
  }


  // @Post('upload')
  // async uploadEvent(@Body() body: { imageUrl: string; lat?: number; lon?: number }) {
  //   return this.eventService.processEventImage(body.imageUrl, body.lat, body.lon);
  // }

  @Post('upload/event')
  async uploadEvent(@Body() body: {}) {

  }

  @Get('search')
  async searchEvents(@Query('query') query: string, @Query('location') location?: string) {
    return this.eventService.searchEvents({ query, location });
  }

  @Get('byId')
  async getEventById(@Query('id') id: string) {
    return this.eventService.getEventById(id);
  }

  @Get('byIds')
  async getEventsByIds(@Query('ids') ids: string) {
    return this.eventService.getEventsByIds(ids.split(','));
  }

  /**
 * Gibt die neuesten 30 Events zurück, sortiert nach Erstellungsdatum.
 */
  @Get('latest')
  async getLatestEvents(@Query('limit') limit: number = 10) {
    const events = await this.eventService.findLatest(limit);
    return { events };
  }


  @Get('nearby')
  async getNearbyEvents(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('maxDistance') maxDistance: string
  ) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const distanceNum = parseFloat(maxDistance) || 10;

    if (isNaN(latNum) || isNaN(lonNum)) {
      return { error: 'Invalid coordinates' };
    }

    return this.eventService.findNearbyEvents(latNum, lonNum, distanceNum);
  }

  @Get('favorites')
  async getUserFavorites(@Query('ids') ids: string) {
    if (!ids) {
      return { error: 'Keine Favoriten-IDs angegeben' };
    }

    const eventIds = ids.split(',');
    return this.eventService.getUserFavorites(eventIds);
  }


  // HOST EVENTS ------------------------------------------------------
  @Get('host/:hostId')
  async getEventsByHost(@Param('hostId') hostId: string) {
    return this.eventService.findByHostId(hostId);
  }

  // CREATE EVENT ------------------------------------------------------
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createEvent(
    @Body() eventData: CreateEventDto,
    @Request() req,
    @UploadedFile() image?: Express.Multer.File
  ) {
    const user = req.user;
    console.log('User from request:', user); // Debug

    if (!user?._id) {
      throw new UnauthorizedException('No user ID found in token');
    }

    const parsedData = this.eventMapper.toEntity({
      ...eventData,
    }, user._id.toString()); // 👈 _id als String

    return await this.eventService.createEvent(parsedData, image);
  }

  @Get('category/:category')
  async getEventsByCategory(
    @Param('category') category: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      this.eventService.findByCategory(category, skip, limit),
      this.eventService.countByCategory(category),
    ]);

    return {
      events,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  @Get()
  async getAllEvents() {
    return this.eventService.findAll();
  }
}

