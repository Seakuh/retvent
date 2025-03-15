import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventMapper } from '../../application/mappers/event.mapper';
import { EventService } from '../../application/services/event.service';
import { CreateEventDto } from '../dtos/create-event.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UploadGuard } from '../guards/upload.guard';

@Controller('events')
export class EventController {
  constructor(
    // private readonly meetupService: MeetupService,
    private readonly eventService: EventService,
    private readonly eventMapper: EventMapper,
  ) {}

  @Get('search/plattforms')
  async searchEventPlattforms(
    @Query('query') query: string,
    @Query('location') location?: string,
  ): Promise<any> {
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
    @Body() body: { location: string },
  ) {
    // Location-String zu Objekt parsen
    const locationData = JSON.parse(body.location);

    // Koordinaten extrahieren
    const lonFromBodyCoordinates = locationData.coordinates[0];
    const latFromBodyCoordinates = locationData.coordinates[1];

    return this.eventService.processEventImageUpload(
      image,
      lonFromBodyCoordinates,
      latFromBodyCoordinates,
    );
  }

  @Post('v2/upload/event-image')
  @UseGuards(UploadGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadEventImageV2(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: { location: string },
    @Request() req,
  ) {
    console.log('V2 Upload - Request received');
    console.log('V2 Upload - Auth user:', req.user);
    console.log('V2 Upload - Headers:', req.headers);

    try {
      // Location-String zu Objekt parsen
      const locationData = JSON.parse(body.location);
      console.log('V2 Upload - Location data:', locationData);

      // Koordinaten extrahieren
      const lonFromBodyCoordinates = locationData.coordinates[0];
      const latFromBodyCoordinates = locationData.coordinates[1];

      return this.eventService.processEventImageUpload(
        image,
        lonFromBodyCoordinates,
        latFromBodyCoordinates,
        req.user.id,
      );
    } catch (error) {
      console.error('V2 Upload - Error:', error);
      throw error;
    }
  }

  @Get('search')
  async searchEvents(
    @Query('query') query?: string,
    @Query('city') city?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const searchParams = {
      query,
      city,
      dateRange: startDate && endDate ? { startDate, endDate } : undefined,
    };
    return this.eventService.searchEvents(searchParams);
  }

  @Get('search/city')
  async searchByCity(@Query('query') city: string) {
    if (!city || city.length < 2) {
      throw new BadRequestException(
        'City query must be at least 2 characters long',
      );
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
    @Query('distance') distance: string = '10',
    @Query('limit') limit: number = 30,
  ) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const distanceNum = parseFloat(distance);

    if (isNaN(latNum) || isNaN(lonNum)) {
      throw new BadRequestException('Invalid coordinates');
    }

    return this.eventService.findNearbyEvents(
      latNum,
      lonNum,
      distanceNum,
      limit,
    );
  }

  @Get('nearby/map')
  async getNearbyEventsForMap(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('distance') distance: string = '10',
    @Query('limit') limit: number = 30,
  ) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const distanceNum = parseFloat(distance);

    if (isNaN(latNum) || isNaN(lonNum)) {
      throw new BadRequestException('Invalid coordinates');
    }

    return this.eventService.findNearbyEventsForMap(
      latNum,
      lonNum,
      distanceNum,
      limit,
    );
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

  @Get('host/:username/latest')
  async getLatestEventsByHost(@Param('username') username: string) {
    return this.eventService.findLatestEventsByHost(username);
  }

  @Get('host/id/:hostId')
  async getEventsByHostId(
    @Param('hostId') hostId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      this.eventService.findByHostId(hostId, skip, limit),
      this.eventService.countByHostId(hostId),
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

  // CREATE EVENT ------------------------------------------------------
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createEvent(
    @Request() req,
    @Body() eventData: CreateEventDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const parsedData = this.eventMapper.toEntity(eventData, req.user.sub);
    console.log('Create Event - Parsed data:', parsedData);
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

  @Get('location/:city')
  async getEventsByCity(
    @Param('city') city: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      this.eventService.findByCity(city, skip, limit),
      this.eventService.countByCity(city),
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

  @Get('locations/popular')
  async getPopularLocations(@Query('limit') limit: number = 10) {
    return this.eventService.getPopularCities(limit);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
  ) {
    try {
      const event = await this.eventService.findById(id);

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.hostId !== req.user.sub) {
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
  async deleteEvent(@Param('id') id: string, @Request() req) {
    try {
      const event = await this.eventService.findById(id);

      if (!event) {
        throw new NotFoundException('Event not found');
      }
      console.log('Delete Event - Event:', event);
      console.log('Delete Event - Request user:', req.user);
      console.log('Delete Event - Event hostId:', event.hostId);

      if (event.hostId !== req.user.sub) {
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
