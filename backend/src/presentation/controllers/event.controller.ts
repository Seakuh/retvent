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
  Req,
  Request,
  UnauthorizedException,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { EventMapper } from '../../application/mappers/event.mapper';
import { EventService } from '../../application/services/event.service';
import { CreateEventDto } from '../dtos/create-event.dto';
import { EventSearchResponseDto } from '../dtos/event-search.dto';
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

  // get popular events number, @Query('lon') lon: number, @Query('limit') limit: number = 10) {
  @Get('popular/nearby')
  async getPopularEventsNearby(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('limit') limit: number = 10,
  ) {
    return this.eventService.getPopularEventsNearby(lat, lon, limit);
  }

  @Get('popular/category')
  async getPopularEventsByCategory(
    @Query('category') category: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.eventService.getPopularEventsByCategory(category, limit);
  }

  // get reel events
  @Get('reel/:eventId?')
  async getReelEvents(
    @Param('eventId') eventId?: string,
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 10,
  ) {
    return this.eventService.getReelEvents(eventId, offset, limit);
  }

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

  @Put(':eventId/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateEventImage(
    @Param('eventId') eventId: string,
    @UploadedFile() image: Express.Multer.File,
    @Request() req,
  ) {
    return this.eventService.updateEventImage(eventId, image, req.user.sub);
  }

  @Post('v2/upload/event-image')
  @UseGuards(UploadGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadEventImageV2(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: { location: string },
    @Request() req,
  ) {
    try {
      // Location-String zu Objekt parsen
      const locationData = JSON.parse(body.location);

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

  @Post('v3/upload/event-image')
  @UseGuards(UploadGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadEventImageV3(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: { location: string },
    @Request() req,
  ) {
    try {
      // Location-String zu Objekt parsen
      const locationData = JSON.parse(body.location);

      // Koordinaten extrahieren
      const lonFromBodyCoordinates = locationData.coordinates[0];
      const latFromBodyCoordinates = locationData.coordinates[1];

      return this.eventService.processEventImageUploadV2(
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

  @Post('v4/upload/event-image')
  @UseGuards(UploadGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadEventImageV4(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: { location: string },
    @Request() req,
  ) {
    try {
      // Location-String zu Objekt parsen
      const locationData = JSON.parse(body.location);

      // Koordinaten extrahieren
      const lonFromBodyCoordinates = locationData.coordinates[0];
      const latFromBodyCoordinates = locationData.coordinates[1];

      return this.eventService.processEventImageUploadV4(
        image,
        lonFromBodyCoordinates,
        latFromBodyCoordinates,
        req.user.id,
      );
    } catch (error) {
      console.error('V4 Upload - Error:', error);
      throw error;
    }
  }

  @Post('v5/upload/event-image')
  @UseGuards(UploadGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadEventImageV5(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: { location: string },
    @Request() req,
  ) {
    try {
      // Location-String zu Objekt parsen
      const locationData = JSON.parse(body.location);

      // Koordinaten extrahieren
      const lonFromBodyCoordinates = locationData.coordinates[0];
      const latFromBodyCoordinates = locationData.coordinates[1];

      return this.eventService.processEventImageUploadV5(
        image,
        lonFromBodyCoordinates,
        latFromBodyCoordinates,
        req.user.id,
      );
    } catch (error) {
      console.error('V5 Upload - Error:', error);
      throw error;
    }
  }
  @Post('v6/upload/event-images')
  @UseGuards(UploadGuard)
  @UseInterceptors(FilesInterceptor('images'))
  async uploadEventImagesV6(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() body: { location: string },
    @Request() req,
  ) {
    try {
      // Location-String zu Objekt parsen
      const locationData = JSON.parse(body.location);

      // Koordinaten extrahieren
      const lonFromBodyCoordinates = locationData.coordinates[0];
      const latFromBodyCoordinates = locationData.coordinates[1];

      const results = [];
      for (const image of images) {
        const result = await this.eventService.processEventImageUploadV5(
          image,
          lonFromBodyCoordinates,
          latFromBodyCoordinates,
          req.user.id,
        );
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error('V6 Upload - Error:', error);
      throw error;
    }
  }

  @Post('v1/upload/event-images')
  @UseGuards(UploadGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadEventImages(
    @UploadedFile() images: Express.Multer.File[],
    @Body() body: { location: string },
    @Request() req,
  ) {
    console.log('uploadEventImages', images, body, req);
    try {
      // Location-String zu Objekt parsen
      const locationData = JSON.parse(body.location);

      // Koordinaten extrahieren
      const lonFromBodyCoordinates = locationData.coordinates[0];
      const latFromBodyCoordinates = locationData.coordinates[1];

      return this.eventService.processEventImagesUploadV1(
        images,
        lonFromBodyCoordinates,
        latFromBodyCoordinates,
        req.user.id,
      );
    } catch (error) {
      console.error('V1 Upload - Error:', error);
      throw error;
    }
  }

  @Post('v1/upload/event-image-links')
  @UseGuards(UploadGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadEventImageLinks(
    @Body() body: { links: string[] },
    @Request() req,
  ) {
    console.log('uploadEventImageLinks', body, req);
    try {
      // Koordinaten extrahieren
      const lonFromBodyCoordinates = 13.404954; // Berlin longitude
      const latFromBodyCoordinates = 52.520008; // Berlin latitude

      return this.eventService.processEventImageLinksUploadV1(
        body.links,
        lonFromBodyCoordinates,
        latFromBodyCoordinates,
        req.user.id,
      );
    } catch (error) {
      console.error('V1 Link Upload - Error:', error);
      throw error;
    }
  }

  @Post('v1/upload/event-image-link')
  @UseGuards(UploadGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadEventImageLink(
    @Body() body: { links: string[] },
    @Request() req,
  ) {
    console.log('uploadEventImageLinks', body, req);
    try {
      // Koordinaten extrahieren
      const lonFromBodyCoordinates = 13.404954; // Berlin longitude
      const latFromBodyCoordinates = 52.520008; // Berlin latitude

      return this.eventService.processEventImageLinksUploadV1(
        body.links,
        lonFromBodyCoordinates,
        latFromBodyCoordinates,
        req.user.id,
      );
    } catch (error) {
      console.error('V1 Link Upload - Error:', error);
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

  @Get('categories')
  async getCategories() {
    return this.eventService.getCategories();
  }

  @Get('search/city')
  async searchByCity(@Query('query') city: string) {
    if (!city || city.length < 2) {
      throw new BadRequestException(
        'City query must be at least 2 characters long',
      );
    }
    return this.eventService.searchByCity(city, 40);
  }

  @Get('byId')
  async getEventById(@Query('id') id: string) {
    return this.eventService.getEventById(id);
  }

  @Get('v2/byId')
  async getEventByIdWithHostInformation(@Query('id') id: string) {
    return this.eventService.getEventByIdWithHostInformation(id);
  }

  @Post('favorite/byIds') // statt @Get
  async getEventsByIds(
    @Body()
    body: {
      ids: string[];
      startDate?: string;
      endDate?: string;
      location?: string;
      category?: string;
    },
  ) {
    const dateRange =
      body.startDate && body.endDate
        ? { startDate: body.startDate, endDate: body.endDate }
        : undefined;

    return this.eventService.getUserFavorites(
      body.ids,
      dateRange,
      body.category,
      body.location,
    );
  }

  @Get('byTag')
  async getEventsByTag(@Query('tag') tag: string) {
    return this.eventService.getEventsByTag(tag);
  }

  @Post('update/lineup/profile')
  @UseGuards(JwtAuthGuard)
  async updateLineupProfile(
    @Body() body: { eventId: string; profileId: string },
    @Request() req,
  ) {
    return this.eventService.updateLineupProfile(
      body.eventId,
      body.profileId,
      req.user.id,
    );
  }

  @Get('search/all')
  async searchEventsWithUserInput(
    @Query('location') location?: string,
    @Query('category') category?: string,
    @Query('prompt') prompt?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const events = await this.eventService.searchEventsWithUserInput(
      location,
      category,
      prompt,
      startDate,
      endDate,
    );
    return { events };
  }

  /**
   * Gibt die neuesten 30 Events zurück, sortiert nach Erstellungsdatum.
   */
  @Get('latest')
  async getLatestEvents(@Query('limit') limit: number = 10) {
    const events = await this.eventService.findLatest(limit);
    return { events };
  }

  @Get('similar')
  async getSimilarEvents(
    @Query('id') id: string,
    @Query('limit') limit: number = 2,
  ) {
    const events = await this.eventService.findSimilarEvents(id, limit);
    return { events };
  }

  @Get('advertisement/events')
  async getAdvertisementEvents(@Query('limit') limit: number = 10) {
    const events = await this.eventService.findAdvertisementEvents(limit);
    return { events };
  }

  @Post('create/event/text')
  async createEventByText(@Body() body: { text: string }) {
    return this.eventService.createEventsByText(body.text);
  }

  // @Post('advertisement/create')
  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(FileInterceptor('file'))
  // async createAdvertisementEvent(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() eventData: any,
  //   @Request() req,
  // ) {
  //   const event = await this.eventService.createAdvertisementEvent(
  //     file,
  //     eventData,
  //     req.user.id,
  //   );
  //   return { event };
  // }

  @Get('latest/stars')
  async getLatestEventsStars(@Query('limit') limit: number = 10) {
    const events = await this.eventService.findLatestStars(limit);
    return { events };
  }

  @Get('sponsored/latest')
  async getSponsoredEvents(@Query('limit') limit: number = 10) {
    const events = await this.eventService.findSponsoredEvents(limit);
    return { events };
  }

  @Get('latest/city')
  async getLatestEventsCity(
    @Query('city') city: string,
    @Query('limit') limit: number = 10,
  ) {
    console.log('city', city);
    const events = await this.eventService.findLatestEventsCity(city, limit);
    return { events };
  }

  @Get('today')
  async getTodayEvents() {
    return this.eventService.findTodayEvents();
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

  // @Get('favorites')
  // async getUserFavorites(
  //   @Query('ids') ids: string,
  //   @Query('startDate') startDate?: string,
  //   @Query('endDate') endDate?: string,
  //   @Query('category') category?: string,
  //   @Query('location') location?: string,
  // ) {
  //   if (!ids) {
  //     return { error: 'Keine Favoriten-IDs angegeben' };
  //   }

  //   const eventIds = ids.split(',');
  //   const dateRange =
  //     startDate && endDate
  //       ? { startDate: startDate, endDate: endDate }
  //       : undefined;
  //   return this.eventService.getUserFavorites(
  //     eventIds,
  //     dateRange,
  //     category,
  //     location,
  //   );
  // }

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

  @Get('host/id/:slug')
  async getEventsByHostId(
    @Param('slug') slug: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 40,
  ) {
    const result = await this.eventService.findAndCountBySlug(slug);
    const { events, total } = result;
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

  @Get('host/id/v2/:slug')
  async getEventsByHostIdV2(
    @Param('slug') slug: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 40,
  ) {
    const result = await this.eventService.findAndCountBySlugV2(slug);
    const { events, total } = result;
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
    const event = await this.eventService.createEvent(parsedData, image);
    return event;
  }

  @Get('category/:category')
  async getEventsByCategory(
    @Param('category') category: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 30,
    @Query('location') location?: string,
  ): Promise<EventSearchResponseDto> {
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      this.eventService.findByCategory(category, skip, limit, location),
      this.eventService.countByCategory(category),
    ]);
    return {
      events: events,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    } as EventSearchResponseDto;
  }

  // @Get()
  // async getAllEvents() {
  //   return this.eventService.findAll();
  // }

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

  @Get('search/new')
  async getNewEvents(
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 10,
    @Query('query') query?: string,
  ) {
    return this.eventService.findNewEvents(offset, limit, query);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
  ) {
    try {
      const event = await this.eventService.findByIdForUpdate(id);

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
      const event = await this.eventService.findByIdToDelete(id);

      if (!event) {
        throw new NotFoundException('Event not found');
      }
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

  // ------------------------------------------------------------
  // Validators
  // ------------------------------------------------------------

  @Get(':id/validators')
  @UseGuards(JwtAuthGuard)
  async getEventValidators(@Param('id') id: string, @Request() req) {
    return this.eventService.getEventValidators(id, req.user.sub);
  }

  /**
   * Update event validators (users who can scan tickets)
   * PUT /events/:id/validators
   */
  @Put(':id/validators')
  @UseGuards(JwtAuthGuard)
  async updateEventValidators(
    @Param('id') id: string,
    @Body() body: { validators: string[] },
    @Request() req,
  ) {
    try {
      const event = await this.eventService.findByIdForUpdate(id);

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      // Only event organizer can update validators
      if (event.hostId !== req.user.sub) {
        throw new ForbiddenException(
          'Only the event organizer can manage validators',
        );
      }

      // Update validators using the event service
      const updatedEvent = await this.eventService.update(id, {
        validators: body.validators,
      });

      return {
        message: 'Validators updated successfully',
        validators: updatedEvent.validators || [],
      };
    } catch (error) {
      if (error.name === 'CastError' || error.kind === 'ObjectId') {
        throw new NotFoundException('Event not found');
      }
      throw error;
    }
  }

  @Delete(':id/validators/:validatorId')
  @UseGuards(JwtAuthGuard)
  async removeValidatorFromEvent(@Param('id') id: string, @Request() req) {
    return this.eventService.removeValidatorFromEvent(id, req.user.sub);
  }

  @Post('lineup/upload')
  @UseGuards(UploadGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadLineupPicture(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: { eventId: string },
    @Request() req,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    console.log(
      'uploadLineupPicture',
      body.eventId,
      image,
      req.user.id,
      image.path,
    );
    return this.eventService.uploadLineupPictures(
      body.eventId,
      image,
      req.user.id,
    );
  }

  // @Delete('lineup/delete/:id')
  // @UseGuards(JwtAuthGuard)
  // async deleteLineupPicture(@Param('id') id: string, @Request() req) {
  //   return this.eventService.deleteLineupPicture(id, req.user.id);
  // }

  @Post('picture/upload')
  @UseGuards(UploadGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadEventPicture(
    @UploadedFile() image: Express.Multer.File[],
    @Body() body: { eventId: string },
    @Request() req,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.eventService.uploadEventPictures(
      body.eventId,
      image,
      req.user.id,
    );
  }

  @Post('video/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('video', {
      limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB Limit (anpassbar)
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('video/')) {
          return callback(
            new BadRequestException('Only video files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadEventVideo(
    @UploadedFile() video: Express.Multer.File,
    @Body() body: { eventId: string },
    @Request() req,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.eventService.uploadEventVideo(body.eventId, video, req.user.id);
  }

  @Put(':eventId/prompt')
  @UseGuards(JwtAuthGuard)
  async updateEventFromPrompt(
    @Param('eventId') eventId: string,
    @Body() body: { prompt: string },
    @Request() req,
  ) {
    console.log('updateEventFromPrompt', eventId, body.prompt, req.user.sub);

    return this.eventService.updateEventFromPrompt(
      req.user.sub,
      eventId,
      body.prompt,
    );
  }

  @Post(':eventId/create-sponsored')
  @UseGuards(JwtAuthGuard)
  async createSponsoredEvent(
    @Param('eventId') eventId: string,
    @Body() body: { sponsored: boolean },
    @Request() req,
  ) {
    console.log('createSponsoredEvent', eventId, body.sponsored, req.user.sub);
    return this.eventService.createSponsoredEvent(
      eventId,
      body.sponsored,
      req.user.sub,
    );
  }

  @Post(':eventId/create-payment-intent')
  @UseGuards(JwtAuthGuard)
  async createEventPaymentIntent(
    @Param('eventId') eventId: string,
    // @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    // Hole Event-Informationen
    const event = await this.eventService.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('Event nicht gefunden');
    }

    // Erstelle Payment Intent mit Event-spezifischen Daten
    // const paymentIntent = await this.paymentService.createPaymentIntent({
    //   ...createPaymentIntentDto,
    //   description: `Add for Event: ${event.title}`,
    //   metadata: {
    //     eventId: event.id,
    //     eventTitle: event.title,
    //   },
    // });

    return {
      // clientSecret: paymentIntent.clientSecret,
      // paymentIntentId: paymentIntent.paymentIntentId,
      event: {
        id: event.id,
        title: event.title,
        price: event.price,
      },
    };
  }

  // ------------------------------------------------------------
  // Register Event
  // ------------------------------------------------------------

  @Post('register/event')
  @UseGuards(JwtAuthGuard)
  async registerEvent(@Body() body: { eventId: string }, @Req() req) {
    console.log('registerEvent', body.eventId, req.user.sub);
    return this.eventService.registerEvent(body.eventId, req.user.sub);
  }

  @Post('unregister/event')
  @UseGuards(JwtAuthGuard)
  async unregisterEvent(@Body() body: { eventId: string }, @Req() req) {
    console.log('unregisterEvent', body.eventId, req.user.sub);
    return this.eventService.unregisterEvent(body.eventId, req.user.sub);
  }

  @Get('registered/events')
  @UseGuards(JwtAuthGuard)
  async getRegisteredEvents(@Request() req) {
    return this.eventService.getRegisteredEvents(req.user.id);
  }

  // ------------------------------------------------------------
  // Invite 2 Event
  // ------------------------------------------------------------

  @Post('invite/event')
  @UseGuards(JwtAuthGuard)
  async inviteToEvent(
    @Body() body: { eventId: string; userId: string },
    @Request() req,
  ) {
    return this.eventService.inviteToEvent(
      body.eventId,
      body.userId,
      req.user.id,
    );
  }

  @Get('invites/events')
  @UseGuards(JwtAuthGuard)
  async getInvitesEvents(@Request() req) {
    return this.eventService.getInvitesEvents(req.user.id);
  }

  @Post('accept/invite')
  @UseGuards(JwtAuthGuard)
  async acceptInvite(@Body() body: { eventId: string }, @Request() req) {
    return this.eventService.acceptInvite(body.eventId, req.user.id);
  }

  // ------------------------------------------------------------
  // Connect with Event Member
  // ------------------------------------------------------------
  // @Post('connect/event')
  // @UseGuards(JwtAuthGuard)
  // async connectWithEvent(@Body() body: { eventId: string }, @Request() req) {
  //   return this.eventService.connectWithEvent(body.eventId, req.user.id);
  // }

  // ------------------------------------------------------------
  // CREATE EVENT FULL
  // ------------------------------------------------------------
  @Post('create-full/')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image')) // <-- DIESE ZEILE HINZUFÜGEN!
  async createEventFull(
    @Body() body: any, // <-- 'any' statt typed, weil FormData anders kommt
    @Req() req,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    // Parse the data field if it's a string (from FormData)
    let eventData = body.data;
    if (typeof eventData === 'string') {
      eventData = JSON.parse(eventData);
    }

    return this.eventService.createEventFull(eventData, req.user.sub, image);
  }
}
