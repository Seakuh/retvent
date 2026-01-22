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
  Patch,
  Post,
  Put,
  Query,
  Req,
  Redirect,
  Request,
  Res,
  UnauthorizedException,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor, FilesInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { EventMapper } from '../../application/mappers/event.mapper';
import { EventService } from '../../application/services/event.service';
import { Event } from '../../core/domain/event';
import { CreateEventDto } from '../dtos/create-event.dto';
import { EventSearchResponseDto } from '../dtos/event-search.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';
import { VectorSearchFilterDto } from '../dtos/vector-search-filter.dto';
import { PlanReleaseDto } from '../dtos/plan-release.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UploadGuard } from '../guards/upload.guard';
import { CommunityEventGuard } from '../guards/community-event.guard';
import { ArtistGuard } from '../guards/artist.guard';
import { CommunityAdminGuard } from '../guards/community-admin.guard';

@Controller('events')
export class EventController {
  constructor(
    // private readonly meetupService: MeetupService,
    private readonly eventService: EventService,
    private readonly eventMapper: EventMapper,
  ) {}

  // ========================================================================
  // PUBLIC EVENT ROUTES - Slug-basierte Event-Suche
  // Diese Route muss GANZ OBEN stehen, VOR allen anderen Routen!
  // ========================================================================
  /**
   * Public Route: Findet Event anhand von slugAndId
   * @param slugAndId - Format: "berlin-techno-nacht-a3f9k2" (slug-shortId)
   * @param locale - Locale (de/en), Standard: de
   * @param res - Express Response für Redirects
   * @returns Event oder 301 Redirect zur canonical URL
   */
  @Get('by-slug/:slugAndId')
  async getEventBySlug(
    @Param('slugAndId') slugAndId: string,
    @Query('locale') locale: string = 'de',
    @Res() res: Response,
  ) {
    console.log('[getEventBySlug] Received request:', { slugAndId, locale });
    
    // Schritt A: Parse slugAndId
    const match = slugAndId.match(/^(.+)-([a-f0-9]{6})$/i);
    
    if (!match) {
      console.log('[getEventBySlug] Invalid slug format:', slugAndId);
      throw new NotFoundException('Event not found - invalid slug format');
    }

    const [, , shortId] = match;
    console.log('[getEventBySlug] Parsed shortId:', shortId);
    
    // Validiere shortId Format
    if (!shortId || !/^[a-f0-9]{6}$/i.test(shortId)) {
      console.log('[getEventBySlug] Invalid shortId format:', shortId);
      throw new NotFoundException('Event not found - invalid shortId');
    }

    // Schritt B: Resolve Event über shortId (nicht über slug)
    console.log('[getEventBySlug] Searching for event with shortId:', shortId);
    const event = await this.eventService.findEventBySlugAndShortId(slugAndId);
    
    if (!event) {
      console.log('[getEventBySlug] Event not found for shortId:', shortId);
      throw new NotFoundException('Event not found');
    }
    
    console.log('[getEventBySlug] Event found:', event.id);

    // Validiere locale
    const validLocale = ['de', 'en'].includes(locale) ? locale : 'de';

    // Schritt C: Canonical Check + Redirect (SEO)
    const canonicalUrl = this.eventService.generateCanonicalUrl(event, validLocale);
    
    // Prüfe ob Request canonical ist
    const requestSlug = slugAndId.slice(0, -7);
    const canonicalSlug = event.slug || this.eventMapper['slugService']?.stringToSlug(event.title) || event.title.toLowerCase().replace(/\s+/g, '-');
    const expectedSlugAndId = `${canonicalSlug}-${shortId}`;
    
    // Wenn slug nicht mit canonicalSlug übereinstimmt, redirect
    if (slugAndId !== expectedSlugAndId && requestSlug !== canonicalSlug) {
      return res.redirect(301, canonicalUrl);
    }

    // Wenn canonical passt: 200 und Event ausliefern
    return res.json(event);
  }

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

  @Post('ai/video/generate')
  @UseGuards(UploadGuard, CommunityAdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async generateVideoFromImageWithAI(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { prompt?: string },
    @Request() req,
  ) {
    // This endpoint accepts an image and an optional text prompt,
    // and returns a video clip generated by AI from the image.
    try {
      // service method will handle the AI-based video generation from the uploaded image
      return await this.eventService.createAIVideoClipFromImage(
        file,
        body?.prompt,
        req.user?.id,
      );
    } catch (error) {
      console.error('AI Video Clip Generation Error:', error);
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
    @Query('citySlug') citySlug?: string,
    @Query('category') category?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('eventType') eventType?: string,
    @Query('genre') genre?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    const searchParams = {
      query,
      city,
      citySlug,
      category,
      categorySlug,
      eventType,
      genre,
      dateRange: startDate && endDate ? { startDate, endDate } : undefined,
      status: status || 'published',
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
    // Unterstützt sowohl alte ID-URLs als auch neue Slug-URLs
    const event = await this.eventService.findEventByIdentifier(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
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

  @Get('by-artist/:name')
  async getEventsByArtist(@Param('name') name: string) {
    return this.eventService.getEventsByArtistName(name);
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

  // ----------------------------------------------------------------------------
  // SEARCH EVENTS VECTOR BASED -------------------------------------------------
  // ----------------------------------------------------------------------------
  @Get('all/vector')
  async searchEventsVector(
    @Query('query') query: string,
  ) {
    return this.eventService.findFindPopularVectorBased(100);
  }

  @Get('home/vector')
  @UseGuards(JwtAuthGuard)
  async searchEventsUserBasedHome(
    @Request() req,
  ) {
    return this.eventService.findFindPopularUserBasedHome(req.user.id);
  }

  /**
   * Gibt beliebte Events mit Vector-basierter Suche zurück
   * @param query - Optional: Suchtext für Vector-Suche
   * @param isUpcoming - true für kommende Events, false für vergangene, undefined für alle
   * @param limit - Anzahl der zurückzugebenden Events (Standard: 20)
   */
  @Get('popular/vector')
  async getPopularEventsVector(
    @Query('query') query?: string,
    @Query('isUpcoming') isUpcoming?: string,
    @Query('limit') limit?: number,
  ) {
    const isUpcomingBool =
      isUpcoming === undefined
        ? undefined
        : isUpcoming === 'true' || isUpcoming === '1';
    const limitNum = limit && limit > 0 ? limit : 20;
    return this.eventService.getPopularEventsVectorBased(
      query,
      isUpcomingBool,
      limitNum,
    );
  }

  /**
   * Vector-basierte Suche nach Events mit Query-Text
   * @param query - Suchtext für Vector-Suche (erforderlich)
   * @param isUpcoming - true für kommende Events, false für vergangene, undefined für alle
   * @param limit - Anzahl der zurückzugebenden Events (Standard: 20)
   */
  @Get('search/vector')
  async searchEventsWithVector(
    @Query('query') query: string,
    @Query('isUpcoming') isUpcoming?: string,
    @Query('limit') limit?: number,
  ) {
    if (!query || !query.trim()) {
      throw new BadRequestException('Query parameter is required');
    }
    const isUpcomingBool =
      isUpcoming === undefined
        ? undefined
        : isUpcoming === 'true' || isUpcoming === '1';
    const limitNum = limit && limit > 0 ? limit : 20;
    return this.eventService.searchEventsWithQueryVector(
      query,
      isUpcomingBool,
      limitNum,
    );
  }

  /**
   * Vector-basierte Suche mit erweiterten Filtern
   * Unterstützt alle Filter aus VectorSearchFilterDto
   */
  @Get('search/vector/filtered')
  async searchEventsWithVectorFilters(
    @Query() filters: VectorSearchFilterDto,
  ) {
    const isUpcomingBool =
      filters.isUpcoming === undefined
        ? undefined
        : filters.isUpcoming === 'true' || filters.isUpcoming === '1';

    // Parse komma-separierte Listen
    const musikTypes = filters.musikTypes
      ? filters.musikTypes.split(',').map((t) => t.trim() as 'live' | 'DJ' | 'Genre')
      : undefined;
    const categories = filters.categories
      ? filters.categories.split(',').map((c) => c.trim())
      : undefined;
    const genres = filters.genres
      ? filters.genres.split(',').map((g) => g.trim())
      : undefined;
    const tags = filters.tags
      ? filters.tags.split(',').map((t) => t.trim())
      : undefined;
    const weekdays = filters.weekdays
      ? filters.weekdays.split(',').map((w) => w.trim())
      : undefined;
    const avoidTags = filters.avoidTags
      ? filters.avoidTags.split(',').map((t) => t.trim())
      : undefined;
    const accessibility = filters.accessibility
      ? filters.accessibility.split(',').map((a) => a.trim())
      : undefined;
    const vibeTags = filters.vibeTags
      ? filters.vibeTags.split(',').map((v) => v.trim())
      : undefined;

    // Parse Boolean-Werte
    const parseBool = (value?: string): boolean | undefined => {
      if (value === undefined) return undefined;
      return value === 'true' || value === '1';
    };

    return this.eventService.searchEventsWithVectorFilters({
      query: filters.query,
      limit: filters.limit,
      isUpcoming: isUpcomingBool,
      minAge: filters.minAge,
      maxAge: filters.maxAge,
      region: filters.region,
      city: filters.city,
      lat: filters.lat,
      lon: filters.lon,
      maxDistanceKm: filters.maxDistanceKm,
      musik: {
        types: musikTypes,
        genre: filters.musikGenre,
      },
      category: filters.category,
      categories,
      genres,
      tags,
      maxPrice: filters.maxPrice,
      pricingType: filters.pricingType,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      timeFrom: filters.timeFrom,
      timeTo: filters.timeTo,
      weekdays,
      avoidLoud: parseBool(filters.avoidLoud),
      avoidAlcohol: parseBool(filters.avoidAlcohol),
      avoidCrowds: parseBool(filters.avoidCrowds),
      avoidPolitical: parseBool(filters.avoidPolitical),
      avoidLongDuration: parseBool(filters.avoidLongDuration),
      avoidTags,
      maxLoudnessLevel: filters.maxLoudnessLevel,
      maxCrowdLevel: filters.maxCrowdLevel,
      foodAvailable: parseBool(filters.foodAvailable),
      veganAvailable: parseBool(filters.veganAvailable),
      indoor: parseBool(filters.indoor),
      outdoor: parseBool(filters.outdoor),
      online: parseBool(filters.online),
      accessibility,
      language: filters.language,
      maxEnergyLevel: filters.maxEnergyLevel,
      vibeTags,
      boostToday: parseBool(filters.boostToday),
      boostWeekend: parseBool(filters.boostWeekend),
    });
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
  @UseGuards(JwtAuthGuard, CommunityEventGuard)
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

  /**
   * Toggle comments enabled/disabled for an event
   * PUT /events/:id/comments/toggle
   */
  @Put(':id/comments/toggle')
  @UseGuards(JwtAuthGuard)
  async toggleCommentsEnabled(
    @Param('id') id: string,
    @Request() req,
  ) {
    try {
      const updatedEvent = await this.eventService.toggleCommentsEnabled(
        id,
        req.user.sub,
      );
      return {
        message: `Comments ${updatedEvent.commentsEnabled ? 'enabled' : 'disabled'} successfully`,
        commentsEnabled: updatedEvent.commentsEnabled,
      };
    } catch (error) {
      if (error.name === 'CastError' || error.kind === 'ObjectId') {
        throw new NotFoundException('Event not found');
      }
      throw error;
    }
  }

  /**
   * Plant ein Release für ein Event
   * POST /events/:id/plan-release
   * Setzt das geplante Release-Datum und ändert den Status auf 'draft', falls noch nicht gesetzt
   */
  @Post(':id/plan-release')
  @UseGuards(JwtAuthGuard)
  async planRelease(
    @Param('id') id: string,
    @Body() planReleaseDto: PlanReleaseDto,
    @Request() req,
  ) {
    try {
      const releaseDate = new Date(planReleaseDto.releaseDate);
      
      if (isNaN(releaseDate.getTime())) {
        throw new BadRequestException('Invalid release date format');
      }

      const updatedEvent = await this.eventService.planRelease(
        id,
        releaseDate,
        req.user.sub,
      );

      if (!updatedEvent) {
        throw new NotFoundException('Event not found');
      }

      return {
        message: 'Release planned successfully',
        event: {
          id: updatedEvent.id,
          title: updatedEvent.title,
          status: updatedEvent.status,
          scheduledReleaseDate: updatedEvent.scheduledReleaseDate,
        },
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

  /**
   * Fügt Dokumente zu einem Event hinzu
   * POST /events/:eventId/addDocs
   */
  @Post(':eventId/addDocs')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('documents', 10))
  async addDocumentsToEvent(
    @Param('eventId') eventId: string,
    @UploadedFiles() documents: Express.Multer.File[],
    @Request() req,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    if (!documents || documents.length === 0) {
      throw new BadRequestException('No documents provided');
    }

    return this.eventService.addDocumentsToEvent(
      eventId,
      documents,
      req.user.id,
    );
  }

  /**
   * Ruft Dokumente eines Events ab
   * GET /events/:eventId/documents
   */
  @Get(':eventId/documents')
  async getEventDocuments(@Param('eventId') eventId: string) {
    if (!eventId) {
      throw new BadRequestException('eventId parameter is required');
    }

    const event = await this.eventService.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return {
      eventId: event.id,
      eventTitle: event.title,
      documents: event.documents || [],
      documentCount: event.documents?.length || 0,
    };
  }

  /**
   * Fügt Dokumente zu einem Event hinzu
   * POST /events/:eventId/documents
   */
  @Post(':eventId/documents')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async addDocumentsToEventPost(
    @Param('eventId') eventId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    if (!eventId) {
      throw new BadRequestException('eventId parameter is required');
    }
    if (!files || files.length === 0) {
      throw new BadRequestException('No documents provided');
    }

    return this.eventService.addDocumentsToEvent(
      eventId,
      files,
      req.user.sub,
    );
  }

  /**
   * Entfernt ein Dokument von einem Event
   * DELETE /events/:eventId/documents
   */
  @Delete(':eventId/documents')
  @UseGuards(JwtAuthGuard)
  async removeDocumentFromEvent(
    @Param('eventId') eventId: string,
    @Body() body: { documentUrl: string },
    @Request() req,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.eventService.removeDocumentFromEvent(
      eventId,
      body.documentUrl,
      req.user.id,
    );
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


  @Put(':eventId/v2/prompt')
  @UseGuards(JwtAuthGuard)
  async updateEventFromPromptV2(
    @Param('eventId') eventId: string,
    @Body() body: { prompt: string },
    @Request() req,
  ) {
    console.log('updateEventFromPrompt', eventId, body.prompt, req.user.sub);

    return this.eventService.updateEventFromPromptV2(
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
  @UseGuards(JwtAuthGuard, CommunityEventGuard)
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
  @Get('community/:communityId/events')
  async getEventsByCommunityId(@Param('communityId') communityId: string) {
    return this.eventService.getEventsByCommunityId(communityId);
  }

  // ------------------------------------------------------------
  // SUBEVENTS - CRUD
  // ------------------------------------------------------------

  /**
   * Create a new subevent for a parent event
   * POST /events/:parentId/subevents
   */
  @Post(':parentId/subevents')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createSubevent(
    @Param('parentId') parentId: string,
    @Body() body: any,
    @Request() req,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    // If data is wrapped in a 'data' field (from FormData), extract it
    let eventData = body;
    if (body.data && typeof body.data === 'string') {
      try {
        eventData = JSON.parse(body.data);
      } catch (e) {
        // If parsing fails, use body as is
        eventData = body;
      }
    }

    const parsedData = this.eventMapper.toEntity(eventData, req.user.sub);
    const subevent = await this.eventService.createSubevent(
      parentId,
      parsedData,
      req.user.sub,
      image,
    );
    return subevent;
  }

  /**
   * Get all subevents for a parent event
   * GET /events/:eventId/subevents
   */
  @Get(':eventId/subevents')
  async getSubevents(@Param('eventId') eventId: string) {
    const subevents = await this.eventService.getSubevents(eventId);
    return {
      parentEventId: eventId,
      subevents,
      count: subevents.length,
    };
  }

  /**
   * Get a single subevent by ID
   * GET /events/:parentId/subevents/:subeventId
   */
  @Get(':parentId/subevents/:subeventId')
  async getSubevent(
    @Param('parentId') parentId: string,
    @Param('subeventId') subeventId: string,
  ) {
    const subevent = await this.eventService.getSubevent(parentId, subeventId);
    if (!subevent) {
      throw new NotFoundException('Subevent not found');
    }
    return subevent;
  }

  /**
   * Update a subevent
   * PUT /events/:parentId/subevents/:subeventId
   */
  @Put(':parentId/subevents/:subeventId')
  @UseGuards(JwtAuthGuard)
  async updateSubevent(
    @Param('parentId') parentId: string,
    @Param('subeventId') subeventId: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
  ) {
    try {
      const subevent = await this.eventService.findByIdForUpdate(subeventId);

      if (!subevent) {
        throw new NotFoundException('Subevent not found');
      }

      if (subevent.parentEventId !== parentId) {
        throw new BadRequestException(
          'Subevent does not belong to the specified parent event',
        );
      }

      if (subevent.hostId !== req.user.sub) {
        throw new ForbiddenException('You can only edit your own subevents');
      }

      return this.eventService.update(subeventId, updateEventDto);
    } catch (error) {
      if (error.name === 'CastError' || error.kind === 'ObjectId') {
        throw new NotFoundException('Subevent not found');
      }
      throw error;
    }
  }

  /**
   * Delete a subevent
   * DELETE /events/:parentId/subevents/:subeventId
   */
  @Delete(':parentId/subevents/:subeventId')
  @UseGuards(JwtAuthGuard)
  async deleteSubevent(
    @Param('parentId') parentId: string,
    @Param('subeventId') subeventId: string,
    @Request() req,
  ) {
    try {
      const subevent = await this.eventService.findByIdToDelete(subeventId);

      if (!subevent) {
        throw new NotFoundException('Subevent not found');
      }

      if (subevent.parentEventId !== parentId) {
        throw new BadRequestException(
          'Subevent does not belong to the specified parent event',
        );
      }

      if (subevent.hostId !== req.user.sub) {
        throw new ForbiddenException('You can only delete your own subevents');
      }

      const deleted = await this.eventService.delete(subeventId);
      if (deleted) {
        return { message: 'Subevent deleted successfully' };
      }
      throw new InternalServerErrorException('Failed to delete subevent');
    } catch (error) {
      if (error.name === 'CastError' || error.kind === 'ObjectId') {
        throw new NotFoundException('Subevent not found');
      }
      throw error;
    }
  }

  // ------------------------------------------------------------
  // Get VECTOR PROFILE RESULTS
  // ------------------------------------------------------------

  /**
   * Gibt personalisierte Event-Empfehlungen basierend auf dem Profil-Vector des Users zurück.
   * 
   * Diese Methode verwendet eine Vector-Similarity-Suche (Cosine Similarity) in Qdrant,
   * um Events zu finden, die am besten zum Profil des Users passen. Das Profil-Embedding
   * wird mit den Event-Embeddings verglichen, um die ähnlichsten Events zu identifizieren.
   * 
   * **Funktionsweise:**
   * 1. Das Profil des authentifizierten Users wird geladen
   * 2. Der Profil-Vector (Embedding) wird aus Qdrant abgerufen
   * 3. Eine Vector-Similarity-Suche wird in Qdrant durchgeführt
   * 4. Nur zukünftige Events werden berücksichtigt (start_time >= jetzt)
   * 5. Events werden nach Similarity-Score sortiert (höchste zuerst)
   * 6. Pagination wird angewendet (offset/limit)
   * 7. Events werden aus der Datenbank geladen und mit Scores zurückgegeben
   * 
   * **Pagination (Infinite Scroll Support):**
   * - `offset`: Anzahl der Events, die übersprungen werden sollen (Standard: 0)
   * - `limit`: Anzahl der Events pro Seite (Standard: 20)
   * - Für Infinite Scroll: Bei jedem Scroll-Event den `offset` um `limit` erhöhen
   * 
   * **Beispiel-Verwendung:**
   * ```
   * // Erste Seite (erste 20 Events)
   * GET /events/vector/profile/results/recommendations?offset=0&limit=20
   * 
   * // Zweite Seite (nächste 20 Events)
   * GET /events/vector/profile/results/recommendations?offset=20&limit=20
   * 
   * // Dritte Seite (nächste 20 Events)
   * GET /events/vector/profile/results/recommendations?offset=40&limit=20
   * ```
   * 
   * **Rückgabewert:**
   * Array von Event-Objekten mit Similarity-Scores:
   * ```typescript
   * [
   *   {
   *     event: {
   *       id: string,
   *       title: string,
   *       description: string,
   *       startDate: Date,
   *       // ... weitere Event-Felder
   *     },
   *     similarityScore: number  // 0-1, je höher desto ähnlicher zum Profil
   *   },
   *   ...
   * ]
   * ```
   * 
   * **Similarity-Score:**
   * - Wert zwischen 0 und 1 (Cosine Similarity)
   * - 1.0 = perfekte Übereinstimmung
   * - 0.0 = keine Ähnlichkeit
   * - Events sind nach Score sortiert (höchste zuerst)
   * 
   * **Fehler:**
   * - 401 Unauthorized: User nicht authentifiziert
   * - 404 Not Found: Profil nicht gefunden
   * - 400 Bad Request: Profil hat noch kein Embedding
   * 
   * **Performance:**
   * - Die Methode holt mehr Events von Qdrant (offset + limit + Puffer)
   * - Pagination erfolgt im Service, um die Performance zu optimieren
   * - Nur Events mit Embeddings werden zurückgegeben
   * 
   * @param req - Request-Objekt mit authentifiziertem User (req.user.id)
   * @param offset - Anzahl der Events, die übersprungen werden sollen (Standard: 0)
   * @param limit - Anzahl der Events pro Seite (Standard: 20, Maximum empfohlen: 50)
   * @returns Promise mit Array von Event-Objekten und Similarity-Scores
   * 
   * @example
   * ```typescript
   * // Erste Seite laden
   * const firstPage = await getVectorProfileResults(req, 0, 20);
   * 
   * // Nächste Seite laden (Infinite Scroll)
   * const nextPage = await getVectorProfileResults(req, 20, 20);
   * ```
   */
  @Get('vector/profile/results/recommendations')
  @UseGuards(JwtAuthGuard)
  async getVectorProfileResults(
    @Request() req,
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 20,
  ): Promise<Array<{ event: Event; similarityScore: number }>> {
    const results = await this.eventService.getVectorProfileResults(
      req.user.sub,
      offset,
      limit,
    );
    return results;
  }


  // ========================================================================
  // ADMIN EVENT ROUTES - CRUD Operations
  // ========================================================================
  // 
  // POST /api/events/create (Create) - bereits vorhanden bei Zeile 847
  // PUT /api/events/:id (Update) - bereits vorhanden bei Zeile 925
  // 
  // Die folgenden neuen Endpoints erweitern die bestehende Funktionalität:

  /**
   * POST /api/events/:eventId/publish
   * Veröffentlicht ein Event (Status auf 'published' setzen)
   */
  @Post(':eventId/publish')
  @UseGuards(JwtAuthGuard)
  async publishEvent(
    @Param('eventId') eventId: string,
    @Request() req,
  ) {
    try {
      const event = await this.eventService.findByIdForUpdate(eventId);

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.hostId !== req.user.sub) {
        throw new ForbiddenException('You can only publish your own events');
      }

      const updatedEvent = await this.eventService.update(eventId, {
        status: 'published',
      });

      return {
        message: 'Event published successfully',
        event: updatedEvent,
      };
    } catch (error) {
      if (error.name === 'CastError' || error.kind === 'ObjectId') {
        throw new NotFoundException('Event not found');
      }
      throw error;
    }
  }

  /**
   * POST /api/events/:eventId/unpublish
   * Entfernt ein Event aus der Veröffentlichung (Status auf 'draft' setzen)
   */
  @Post(':eventId/unpublish')
  @UseGuards(JwtAuthGuard)
  async unpublishEvent(
    @Param('eventId') eventId: string,
    @Request() req,
  ) {
    try {
      const event = await this.eventService.findByIdForUpdate(eventId);

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.hostId !== req.user.sub) {
        throw new ForbiddenException('You can only unpublish your own events');
      }

      const updatedEvent = await this.eventService.update(eventId, {
        status: 'draft',
      });

      return {
        message: 'Event unpublished successfully',
        event: updatedEvent,
      };
    } catch (error) {
      if (error.name === 'CastError' || error.kind === 'ObjectId') {
        throw new NotFoundException('Event not found');
      }
      throw error;
    }
  }

  /**
   * GET /api/events/:eventId/edit (Edit-View)
   * Lädt ein Event für die Bearbeitung (inkl. alle Felder)
   * Hinweis: GET /api/events/:eventId könnte mit anderen Routen kollidieren,
   * daher verwenden wir /edit als spezifischere Route
   */
  @Get(':eventId/edit')
  @UseGuards(JwtAuthGuard)
  async getEventForEdit(
    @Param('eventId') eventId: string,
    @Request() req,
  ) {
    try {
      const event = await this.eventService.findByIdForUpdate(eventId);

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.hostId !== req.user.sub) {
        throw new ForbiddenException('You can only view your own events');
      }

      return event;
    } catch (error) {
      if (error.name === 'CastError' || error.kind === 'ObjectId') {
        throw new NotFoundException('Event not found');
      }
      throw error;
    }
  }

  /**
   * GET /api/events/:eventId/slugs (History/Redirects)
   * Lädt die Slug-Historie und Redirects für ein Event
   */
  @Get(':eventId/slugs')
  @UseGuards(JwtAuthGuard)
  async getEventSlugs(
    @Param('eventId') eventId: string,
    @Request() req,
  ) {
    try {
      const event = await this.eventService.findByIdForUpdate(eventId);

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.hostId !== req.user.sub) {
        throw new ForbiddenException('You can only view slugs of your own events');
      }

      // TODO: Implementiere Slug-Historie wenn vorhanden
      // Für jetzt: Rückgabe des aktuellen Slugs
      const slugService = (this.eventService as any).slugService;
      return {
        currentSlug: event.slug,
        canonicalSlug: event.slug || (slugService?.stringToSlug(event.title) || event.title.toLowerCase().replace(/\s+/g, '-')),
        shortId: event.id.slice(-6),
        history: [], // TODO: Slug-Historie implementieren
        redirects: [], // TODO: Redirects implementieren
      };
    } catch (error) {
      if (error.name === 'CastError' || error.kind === 'ObjectId') {
        throw new NotFoundException('Event not found');
      }
      throw error;
    }
  }

  /**
   * POST /api/events/:eventId/slugs (Slug ändern + Redirect anlegen)
   * Ändert den Slug eines Events und legt einen Redirect an
   */
  @Post(':eventId/slugs')
  @UseGuards(JwtAuthGuard)
  async updateEventSlug(
    @Param('eventId') eventId: string,
    @Body() body: { slug: string },
    @Request() req,
  ) {
    try {
      const event = await this.eventService.findByIdForUpdate(eventId);

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.hostId !== req.user.sub) {
        throw new ForbiddenException('You can only change slugs of your own events');
      }

      const oldSlug = event.slug;
      const newSlug = body.slug;

      // Validiere neuen Slug
      if (!newSlug || newSlug.length < 3) {
        throw new BadRequestException('Slug must be at least 3 characters long');
      }

      // TODO: Implementiere Redirect-Logik wenn vorhanden
      // Für jetzt: Slug aktualisieren
      const updatedEvent = await this.eventService.update(eventId, {
        slug: newSlug,
      });

      return {
        message: 'Slug updated successfully',
        oldSlug,
        newSlug,
        event: updatedEvent,
        redirectCreated: false, // TODO: Redirect-Logik implementieren
      };
    } catch (error) {
      if (error.name === 'CastError' || error.kind === 'ObjectId') {
        throw new NotFoundException('Event not found');
      }
      throw error;
    }
  }
}
