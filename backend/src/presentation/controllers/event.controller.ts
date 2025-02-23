import { Body, Controller, Get, Param, Post, Query, Request, Put, Delete, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors, BadRequestException, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventMapper } from '../../application/mappers/event.mapper';
import { EventService } from '../../application/services/event.service';
import { ImageService } from '../../infrastructure/services/image.service';
import { CreateEventDto } from '../dtos/create-event.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateEventDto } from '../dtos/update-event.dto';

@Controller('events')
export class EventController {
  constructor(
    // private readonly meetupService: MeetupService,
    private readonly eventService: EventService,
    private readonly eventMapper: EventMapper,
    private readonly imageService: ImageService
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
  async searchEvents(
    @Query('query') query?: string,
    @Query('city') city?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const searchParams = {
      query,
      city,
      dateRange: startDate && endDate ? { startDate, endDate } : undefined
    };
    return this.eventService.searchEvents(searchParams);
  }

  @Get('search/city')
  async searchByCity(@Query('query') city: string) {
    if (!city || city.length < 2) {
      throw new BadRequestException('City query must be at least 2 characters long');
    }
    return this.eventService.searchByCity(city);
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
    @Query('distance') distance: string = '10'
  ) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const distanceNum = parseFloat(distance);

    if (isNaN(latNum) || isNaN(lonNum)) {
      throw new BadRequestException('Invalid coordinates');
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
  @Get('host/:username')
  @UseGuards(JwtAuthGuard)
  async getEventsByHost(@Param('username') username: string) {
    return this.eventService.findEventsByHost(username);
  }

  @Get('host/id/:hostId')
  async getEventsByHostId(
    @Param('hostId') hostId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      this.eventService.findByHostId(hostId, skip, limit),
      this.eventService.countByHostId(hostId)
    ]);

    return {
      events,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // CREATE EVENT ------------------------------------------------------
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createEvent(
    @Request() req,
    @Body() eventData: CreateEventDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    const parsedData = this.eventMapper.toEntity(eventData, req.user.id);
    const event = await this.eventService.createEvent(parsedData, image);
    return event;
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

  // PUBLIC EVENT CREATION ------------------------------------------------------
  // @Post('create/public')
  // @UseInterceptors(FileInterceptor('image'))
  // async createPublicEvent(
  //   @Body() eventData: CreateEventDto,
  //   @UploadedFile() image?: Express.Multer.File
  // ) {
  //   const parsedData = this.eventMapper.toEntity({
  //     ...eventData,
  //   }, 'public'  // Default public username
  //   );

  //   return await this.eventService.createEvent(parsedData, image);
  // }

  @Get('location/:city')
  async getEventsByCity(
    @Param('city') city: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      this.eventService.findByCity(city, skip, limit),
      this.eventService.countByCity(city)
    ]);

    return {
      events,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  @Get('locations/popular')
  async getPopularLocations(
    @Query('limit') limit: number = 10
  ) {
    return this.eventService.getPopularCities(limit);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req
  ) {
    try {
      const event = await this.eventService.findById(id);
      
      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.hostId !== req.user.id) {
        throw new ForbiddenException('You can only edit your own events');
      }

      return this.eventService.update(id, updateEventDto);
    } catch (error) {
      if (error.name === 'CastError' || error.kind === 'ObjectId') {
        throw new NotFoundException('Event not found');
      }
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteEvent(
    @Param('id') id: string,
    @Request() req
  ) {
    try {
      const event = await this.eventService.findById(id);
      
      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.hostId !== req.user.id) {
        throw new ForbiddenException('You can only delete your own events');
      }

      const deleted = await this.eventService.delete(id);
      if (deleted) {
        return { message: 'Event deleted successfully' };
      }
      throw new InternalServerErrorException('Failed to delete event');
    } catch (error) {
      if (error.name === 'CastError' || error.kind === 'ObjectId') {
        throw new NotFoundException('Event not found');
      }
      throw error;
    }
  }
}

