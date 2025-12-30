import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { ChatGPTService } from 'src/infrastructure/services/chatgpt.service';
import { GeolocationService } from 'src/infrastructure/services/geolocation.service';
import { QdrantService } from 'src/infrastructure/services/qdrant.service';
import { CreateFullEventDto } from 'src/presentation/dtos/create-full-event.dto';
import { MapEventDto } from 'src/presentation/dtos/map-event.dto';
import { UpdateEventDto } from 'src/presentation/dtos/update-event.dto';
import { Event, EventWithHost } from '../../core/domain/event';
import { MongoEventRepository } from '../../infrastructure/repositories/mongodb/event.repository';
import { ImageService } from '../../infrastructure/services/image.service';
import { MuxService } from '../../infrastructure/services/mux.service';
import { ReplicateService } from '../../infrastructure/services/replicate.service';
import { VideoService } from '../../infrastructure/services/video.service';
import { FeedService } from './feed.service';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';
import { CommunityService } from './community.service';
@Injectable()
export class EventService {
  
  constructor(
    private readonly eventRepository: MongoEventRepository,
    private readonly imageService: ImageService,
    private readonly chatGptService: ChatGPTService,
    private readonly geolocationService: GeolocationService,
    private readonly profileService: ProfileService,
    private readonly userService: UserService,
    private readonly feedService: FeedService,
    private readonly videoService: VideoService,
    private readonly qdrantService: QdrantService,
    private readonly communityService: CommunityService,
    private readonly replicateService: ReplicateService,
    private readonly muxService: MuxService,
  ) {}
  getEventsByTag(tag: string) {
    return this.eventRepository.getEventsByTag(tag);
  }
  searchEventsWithUserInput(
    location?: string,
    category?: string,
    prompt?: string,
    startDate?: string,
    endDate?: string,
  ) {
    if (!startDate && !endDate) {
      return this.eventRepository.findTodayEvents();
    }
    return this.eventRepository.searchEventsWithUserInput(
      location,
      category,
      prompt,
      startDate,
      endDate,
    );
  }

  async findSimilarEvents(id: string, limit: number | string = 2) {
    const eventFromRepository = await this.eventRepository.findById(id);
    if (!eventFromRepository) {
      throw new NotFoundException('Event not found');
    }
    if (
      !Array.isArray(eventFromRepository.embedding) ||
      !eventFromRepository.embedding.length
    ) {
      throw new BadRequestException(
        'Das Event besitzt noch kein Embedding und kann nicht empfohlen werden.',
      );
    }

    const parsedLimit = Number(limit ?? 2);
    const safeLimit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 2;

    const searchResults = await this.qdrantService.searchEventsSimilar({
      vector: eventFromRepository.embedding,
      limit: safeLimit + 1, // extra slot in case the event matches itself
      withPayload: true,
    });

    const orderedIds = searchResults
      .map((hit) => this.extractEventIdFromPayload(hit.payload))
      .filter(
        (eventId): eventId is string =>
          Boolean(eventId) && eventId !== eventFromRepository.id,
      );

    if (!orderedIds.length) {
      return [];
    }

    const uniqueIds = Array.from(new Set(orderedIds));
    const relatedEvents = await this.eventRepository.findByIds(uniqueIds);
    const relatedEventMap = new Map(
      relatedEvents.map((event) => [event.id, event]),
    );

    const enriched = searchResults
      .map((hit) => {
        const eventId = this.extractEventIdFromPayload(hit.payload);
        if (!eventId || eventId === eventFromRepository.id) {
          return null;
        }
        const event = relatedEventMap.get(eventId);
        if (!event) {
          return null;
        }
        return {
          event,
          payload: (hit.payload ?? {}) as Record<string, any>,
        };
      })
      .filter(
        (
          result,
        ): result is {
          event: Event;
          score: number;
          payload: Record<string, any>;
        } => Boolean(result),
      )
      .slice(0, safeLimit);

    return enriched;
  }

  async createEventsByText(text: string) {
    const events = await this.chatGptService.generateEventsFromText(text);
    for (const event of events) {
      await this.eventRepository.create(event);
    }
    return events;
  }

  // createAdvertisementEvent(file: Express.Multer.File, eventData: any, id: any) {
  //   this.eventRepository.createAvertisementEvent();
  // }

  getReelEvents(eventId?: string, offset?: number, limit?: number) {
    return this.eventRepository.getReelEvents(eventId || '', offset, limit);
  }

  findAdvertisementEvents(limit: number) {
    return this.eventRepository.findAdvertisementEvents(limit);
  }

  findNewEvents(offset: number, limit: number, query: string) {
    return this.eventRepository.findNewEvents(offset, limit, query);
  }

  getRankedPopularEvents() {
    return this.eventRepository.getRankedPopularEvents();
  }

  getEventsByArtistName(name: string) {
    return this.eventRepository.getEventsByArtistName(name);
  }

  async findLatestEventsCity(city: string, limit: number) {
    const coordinates = await this.geolocationService.getCoordinates(city);
    const cityLocationEvents = await this.findNearbyEvents(
      coordinates.latitude,
      coordinates.longitude,
      100,
      limit,
    );
    const cityNameEvents = await this.eventRepository.searchByCity(city, limit);
    return [...cityLocationEvents, ...cityNameEvents];
  }
  updateLineupProfile(eventId: string, profileId: string, userId: string) {
    return this.eventRepository.updateLineupProfile(eventId, profileId, userId);
  }

  findLatestStars(limit: number) {
    return this.eventRepository.findLatestStars(limit);
  }

  getPopularEventsNearby(lat: number, lon: number, limit: number) {
    return this.eventRepository.getPopularEventsNearby(lat, lon, limit);
  }

  getPopularEventsByCategory(category: string, limit: number) {
    return this.eventRepository.getPopularEventsByCategory(category, limit);
  }

  findSponsoredEvents(limit: number) {
    return this.eventRepository.findSponsoredEvents(limit);
  }

  async getCategories() {
    return await this.eventRepository.getCategories();
  }
  findLatestEventsByHost(username: string) {
    return this.eventRepository.findLatestEventsByHost(username);
  }

  searchByCity(city: string, limit: number) {
    return this.eventRepository.searchByCity(city, limit);
  }

  async processEventImageLinksUploadV1(
    links: string[],
    lon: number,
    lat: number,
    userId: string,
  ) {
    console.info('[EventService] Processing event images from links');

    const createdEvents = [];

    for (const link of links) {
      try {
        // 1. Bild herunterladen
        const imageBuffer = await this.downloadImage(link);

        // 2. Bild direkt aus Buffer hochladen
        const uploadedImageUrl =
          await this.imageService.uploadImageFromBuffer(imageBuffer);
        if (!uploadedImageUrl) {
          throw new BadRequestException('Failed to upload image');
        }

        // 3. Eventdaten extrahieren (optional)
        let extractedEventData = {};
        try {
          extractedEventData =
            await this.chatGptService.extractEventFromFlyer(uploadedImageUrl);
        } catch (error) {
          console.warn(
            '⚠️ Eventdaten konnten nicht extrahiert werden:',
            error.message,
          );
        }

        // 4. Hostdaten holen
        const profile = await this.profileService.getProfileByUserId(userId);
        const hostImageUrl = profile?.profileImageUrl;

        // 5. Eventobjekt erstellen
        const eventData = {
          ...extractedEventData,
          imageUrl: uploadedImageUrl,
          uploadLat: lat,
          uploadLon: lon,
          createdAt: new Date(),
          updatedAt: new Date(),
          location: {
            coordinates: {
              lat,
              lon,
            },
          },
          status: 'pending',
          hostId: userId || 'public',
          host: {
            profileImageUrl: hostImageUrl || undefined,
            username: profile?.username || undefined,
          },
        };

        const createdEvent = await this.eventRepository.create(eventData);
        await this.profileService.addCreatedEvent(userId, createdEvent.id);
        await this.userService.addUserPoints(userId, 20);
        await this.feedService.pushFeedItemFromEvent(createdEvent, 'event');

        createdEvents.push(createdEvent);
      } catch (error) {
        console.error(
          `❌ Fehler beim Verarbeiten des Bildes (${link}):`,
          error.message,
        );
      }
    }

    return createdEvents;
  }

  getEventsByCommunityId(communityId: string) {
    return this.eventRepository.getEventsByCommunityId(communityId);
  }

  private async downloadImage(url: string): Promise<Buffer> {
    // Instagram URL ggf. anpassen
    if (url.includes('instagram.com')) {
      url = url.split('?')[0].replace(/\d+_n\.jpg$/, '1080_n.jpg');
    }

    const proxyServices = [
      (url: string) =>
        `https://images.weserv.nl/?url=${encodeURIComponent(url)}`,
      (url: string) =>
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
    ];

    let lastError: any;

    for (const proxyFn of proxyServices) {
      const proxyUrl = proxyFn(url);
      console.log(`🔁 Versuche Proxy: ${proxyUrl}`);

      try {
        const response = await axios.get(proxyUrl, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept:
              'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
          },
          timeout: 10000,
        });

        const contentType = response.headers['content-type'];
        if (contentType?.startsWith('image/')) {
          console.log(`✅ Bild erfolgreich geladen von ${proxyUrl}`);
          return Buffer.from(response.data, 'binary');
        } else {
          console.warn(`⚠️ Kein Bild-Content-Type: ${contentType}`);
        }
      } catch (err) {
        console.warn(`❌ Fehler bei Proxy ${proxyUrl}:`, err.message);
        lastError = err;
      }
    }

    console.error('❗️Alle Proxy-Versuche fehlgeschlagen:', lastError);
    throw new Error(
      `Bild konnte nicht heruntergeladen werden: ${lastError?.message || 'Unbekannter Fehler'}`,
    );
  }

  private extractEventIdFromPayload(payload: any): string | undefined {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const candidate =
      payload.eventId ?? payload.id ?? payload.sourceId ?? payload.originalId;

    if (typeof candidate === 'string' && candidate.length) {
      return candidate;
    }

    return undefined;
  }

  async findAll() {
    const events = await this.eventRepository.findAllWithCommentCount();
    return events.map((event) => this.toEntity(event));
  }

  async findAllWithEmbedding(limit: number) {
    const events = await this.eventRepository.findAllWithEmbedding(limit);
    return events;
  }

  async findById(id: string) {
    const event = await this.eventRepository.findByIdWithCommentCount(id);
    return event ? this.toEntity(event) : null;
  }

  async findByEventId(eventId: string) {
    return this.eventRepository.findById(eventId);
  }

  findByIdForUpdate(id: string) {
    return this.eventRepository.findById(id);
  }

  async getEventById(id: string): Promise<Event | null> {
    return this.eventRepository.findById(id);
  }

  processEventImagesUploadV1(
    images: Express.Multer.File[],
    lonFromBodyCoordinates: any,
    latFromBodyCoordinates: any,
    id: any,
  ) {
    throw new Error('Method not implemented.');
  }

  async getEventByIdWithHostInformation(
    id: string,
  ): Promise<EventWithHost | null> {
    const event = await this.eventRepository.findById(id);
    const profile = await this.profileService.getEventProfile(event.hostId);
    return {
      ...event,
      host: profile,
    };
  }

  async uploadEventLinupPicture(
    eventId: string,
    image: Express.Multer.File,
    userId: string,
  ) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.hostId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to upload pictures to this event',
      );
    }
    const imageUrl = await this.imageService.uploadImage(image);
    await this.eventRepository.uploadEventLinupPicture(eventId, imageUrl);
    await this.feedService.pushFeedItemFromEventPictures(event, 'lineup', [
      imageUrl,
    ]);
    return event;
  }

  async uploadEventPictures(
    eventId: string,
    images: Express.Multer.File[],
    userId: string,
  ) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.hostId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to upload pictures to this event',
      );
    }
    const imageUrls = [];
    for (const image of images) {
      const imageUrl = await this.imageService.uploadImage(image);
      imageUrls.push(imageUrl);
    }
    await this.eventRepository.uploadEventPictures(eventId, imageUrls);
    await this.feedService.pushFeedItemFromEventPictures(
      event,
      'picture',
      imageUrls,
    );
    return event;
  }

  async uploadEventVideo(
    eventId: string,
    video: Express.Multer.File,
    userId: string,
  ) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.hostId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to upload pictures to this event',
      );
    }
    const videoUrl = await this.videoService.uploadVideo(video);
    await this.eventRepository.uploadEventVideo(eventId, videoUrl);
    await this.feedService.pushFeedItemFromEvent(event, 'video');
    return event;
  }

  async getEventsByIds(
    ids: string[],
    dateRange?: { startDate?: string; endDate?: string },
    category?: string,
    location?: string,
  ): Promise<Event[]> {
    return this.eventRepository.getUserFavorites(
      ids,
      dateRange,
      category,
      location,
    );
  }

  async findByLocationId(locationId: string): Promise<Event[]> {
    return this.eventRepository.findByLocationId(locationId);
  }

  async findLatest(limit: number = 10): Promise<Event[]> {
    return this.eventRepository.findLatest(limit);
  }

  async findByIdToDelete(id: string): Promise<Event> {
    return this.eventRepository.findById(id);
  }

  async findByCategory(
    category: string,
    skip: number = 0,
    limit: number = 10,
    location?: string,
  ): Promise<Event[]> {
    return this.eventRepository.findByCategory(category, skip, limit, location);
  }

  async countByCategory(category: string): Promise<number> {
    return this.eventRepository.countByCategory(category);
  }

  async findNearbyEvents(
    lat: number,
    lon: number,
    distance: number,
    limit: number,
  ): Promise<Event[]> {
    return this.eventRepository.findNearbyEvents(lat, lon, distance, limit);
  }

  async findNearbyEventsForMap(
    lat: number,
    lon: number,
    distance: number,
    limit: number,
  ): Promise<MapEventDto[]> {
    return this.eventRepository.findNearbyEventsForMap(
      lat,
      lon,
      distance,
      limit,
    );
  }

  async getUserFavorites(
    eventIds: string[],
    dateRange?: { startDate?: string; endDate?: string },
    category?: string,
    location?: string,
  ): Promise<Event[]> {
    return this.eventRepository.getUserFavorites(
      eventIds,
      dateRange ? dateRange : undefined,
      location ? location : undefined,
      category ? category : undefined,
    );
  }

  async create(eventData: Partial<Event>): Promise<Event> {
    return this.eventRepository.create(eventData);
  }

  async createEvent(
    eventData: Partial<Event>,
    image?: Express.Multer.File,
  ): Promise<Event> {
    try {
      let imageUrl = undefined;

      if (image) {
        imageUrl = await this.imageService.uploadImage(image);
      }
      const eventWithImage = {
        ...eventData,
        imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Permission check for Community Events
      if (eventWithImage.communityId) {
        const hasPermission = await this.communityService.checkUserCanCreateEvent(
          eventWithImage.communityId,
          eventData.hostId,
        );

        if (!hasPermission) {
          throw new ForbiddenException(
            'Only moderators and admins can create community events',
          );
        }
      }

      const newEvent =
        await this.eventRepository.createEventFromFormData(eventWithImage);

      // Auto-Link to Community if communityId is present
      if (newEvent.communityId) {
        try {
          await this.communityService.addEventToCommunity(newEvent.communityId, newEvent.id);
        } catch (error) {
          // Rollback: Delete event if community linking fails
          await this.eventRepository.delete(newEvent.id);
          throw new BadRequestException(
            `Failed to link event to community: ${error.message}`,
          );
        }
      }

      await this.feedService.pushFeedItemFromEvent(newEvent, 'event');
      return newEvent;
    } catch (error) {
      throw new BadRequestException(`Failed to create event: ${error.message}`);
    }
  }

  async botViewEvent(id: string) {
    return this.eventRepository.botViewEvent(id);
  }

  async findTodayEvents(): Promise<Event[]> {
    return this.eventRepository.findTodayEvents();
  }

  async update(id: string, eventData: UpdateEventDto): Promise<Event | null> {
    return this.eventRepository.update(id, eventData);
  }

  async delete(id: string): Promise<boolean> {
    // Get event to check for communityId
    const event = await this.eventRepository.findById(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Remove event from community if linked
    if (event.communityId) {
      try {
        await this.communityService.removeEventFromCommunity(event.communityId, id);
      } catch (error) {
        // Log error but continue with deletion
        console.error('Failed to remove event from community:', error);
      }
    }

    return this.eventRepository.delete(id);
  }

  async addLike(eventId: string, userId: string): Promise<Event | null> {
    return this.eventRepository.addLike(eventId, userId);
  }

  async removeLike(eventId: string, userId: string): Promise<Event | null> {
    return this.eventRepository.removeLike(eventId, userId);
  }

  // #########################################################
  // AI Video Clip Generation from Image
  // #########################################################
  async createAIVideoClipFromImage(
    file: Express.Multer.File,
    prompt?: string,
    userId?: string,
  ) {

    const event = await this.processEventImageUploadV5(file, 0, 0, userId);
    if (!event) {
      throw new BadRequestException('Failed to create event');
    }


    try {
      // Erstelle Video mit Replicate (kling-v2.1)
      const prediction = await this.replicateService.createVideoFromImage({
        image: file,
        prompt: await this.chatGptService.generateVideoPrompt(event),
        duration: 5, // 5 Sekunden
        guidance_scale: 0.5,
        width: 720,
        height: 720,
        // width: 576 as 720 | 1080,     // Smartphone-gerechte Breite (9:16, z. B. 576x1024)
        // height: 1024,  
      });

      // Warte auf das Ergebnis (optional, kann auch async sein)
      const result = await this.replicateService.waitForPrediction(
        prediction.id,
        300000, // 5 Minuten max
      );

      if (result.status !== 'succeeded' || !result.output) {
        throw new Error(
          `Video generation failed: ${result.error || 'Unknown error'}`,
        );
      }

      // Video-URL von Replicate
      const videoUrl =
        typeof result.output === 'string' ? result.output : result.output[0];

      // Lade Video zu Mux hoch für bessere Darstellung und Analytics
      const muxAsset = await this.muxService.createAssetFromUrl(
        videoUrl,
        'public',
      );

      // Warte bis Mux das Asset verarbeitet hat
      let asset = muxAsset;
      let attempts = 0;
      while (asset.status !== 'ready' && attempts < 30) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 Sekunden warten
        asset = await this.muxService.getAsset(asset.id);
        attempts++;
      }

      // Erstelle Playback-URLs
      const playbackUrl = this.muxService.getPlaybackUrl(asset);
      const mp4Url = this.muxService.getMp4Url(asset);

      const eventWithVideo = await this.eventRepository.uploadEventVideo(event.id, videoUrl);
      console.log('eventWithVideo', eventWithVideo);

      return {
        predictionId: prediction.id,
        muxAssetId: asset.id,
        videoUrl: videoUrl, // Original von Replicate
        playbackUrl: playbackUrl, // HLS-Stream von Mux
        mp4Url: mp4Url, // MP4 von Mux (falls verfügbar)
        muxDataEnvironmentKey: this.muxService.getDataEnvironmentKey(),
        status: asset.status,
        videoUrlEvent: event.videoUrls[0],
      };
    } catch (error) {
      console.error('Failed to create AI video clip:', error);
      throw new Error(
        `Failed to create AI video clip: ${error.message || 'Unknown error'}`,
      );
    }
  }

  // #########################################################

  async processEventImageUpload(
    image: Express.Multer.File,
    lat?: number,
    lon?: number,
    userId?: string,
  ): Promise<Event> {
    try {
      // 1. Upload image and get URL
      const uploadedImageUrl = await this.imageService.uploadImage(image);
      if (!uploadedImageUrl) {
        throw new BadRequestException('Failed to upload image');
      }

      // 2. Try to extract event data from image, but don't fail if it doesn't work
      let extractedEventData = {};
      try {
        extractedEventData =
          await this.chatGptService.extractEventFromFlyer(uploadedImageUrl);
      } catch (error) {
        console.warn('Failed to extract event data from image:', error);
      }

      // 4. Create event with all available data
      const eventData = {
        ...extractedEventData,
        imageUrl: uploadedImageUrl,
        uploadLat: lat,
        uploadLon: lon,
        createdAt: new Date(),
        updatedAt: new Date(),
        location: {
          coordinates: {
            lat: lat,
            lon: lon,
          },
        },
        status: 'pending',
        hostId: userId || 'public', // Setze hostId auf userId wenn vorhanden, sonst 'public'
      };

      const createdEvent = await this.eventRepository.create(eventData);
      console.log('#######################Created event:', createdEvent);
      await this.feedService.pushFeedItemFromEvent(createdEvent, 'event');
      return createdEvent;
    } catch (error) {
      console.error('Failed to process event image upload:', error);
      throw new BadRequestException(
        `Failed to process event image: ${error.message}`,
      );
    }
  }

  async processEventImageUploadV2(
    image: Express.Multer.File,
    lat?: number,
    lon?: number,
    userId?: string,
  ): Promise<Event> {
    console.info('[EventService] Processing new event (v2)');
    try {
      // 1. Upload image and get URL
      const uploadedImageUrl = await this.imageService.uploadImage(image);
      if (!uploadedImageUrl) {
        throw new BadRequestException('Failed to upload image');
      }

      // 2. Try to extract event data from image, but don't fail if it doesn't work
      let extractedEventData = {};
      try {
        extractedEventData =
          await this.chatGptService.extractEventFromFlyer(uploadedImageUrl);
      } catch (error) {
        console.warn('Failed to extract event data from image:', error);
      }

      // 4. Create event with all available data
      const eventData = {
        ...extractedEventData,
        imageUrl: uploadedImageUrl,
        uploadLat: lat,
        uploadLon: lon,
        createdAt: new Date(),
        updatedAt: new Date(),
        location: {
          coordinates: {
            lat: lat,
            lon: lon,
          },
        },
        status: 'pending',
        hostId: userId || 'public', // Setze hostId auf userId wenn vorhanden, sonst 'public'
      };

      const createdEvent = await this.eventRepository.create(eventData);
      await this.profileService.addCreatedEvent(userId, createdEvent.id);
      await this.feedService.pushFeedItemFromEvent(createdEvent, 'event');
      return createdEvent;
    } catch (error) {
      console.error('Failed to process event image upload:', error);
      throw new BadRequestException(
        `Failed to process event image: ${error.message}`,
      );
    }
  }

  async processEventImageUploadV4(
    image: Express.Multer.File,
    lat?: number,
    lon?: number,
    userId?: string,
  ): Promise<Event> {
    console.info('[EventService] Processing new event (v4)');
    try {
      // 1. Upload image and get URL
      const uploadedImageUrl = await this.imageService.uploadImage(image);
      if (!uploadedImageUrl) {
        throw new BadRequestException('Failed to upload image');
      }

      // 2. Try to extract event data from image, but don't fail if it doesn't work
      let extractedEventData = {};
      try {
        extractedEventData =
          await this.chatGptService.extractEventFromFlyer(uploadedImageUrl);
      } catch (error) {
        console.warn('Failed to extract event data from image:', error);
      }

      // 4. Create event with all available data
      const eventData = {
        ...extractedEventData,
        imageUrl: uploadedImageUrl,
        uploadLat: lat,
        uploadLon: lon,
        createdAt: new Date(),
        updatedAt: new Date(),
        location: {
          coordinates: {
            lat: lat,
            lon: lon,
          },
        },
        status: 'pending',
        hostId: userId || 'public', // Setze hostId auf userId wenn vorhanden, sonst 'public'
      };

      const createdEvent = await this.eventRepository.create(eventData);
      await this.profileService.addCreatedEvent(userId, createdEvent.id);
      await this.userService.addUserPoints(userId, 20);

      // Add feed item to feed
      await this.feedService.pushFeedItemFromEvent(createdEvent, 'event');
      return createdEvent;
    } catch (error) {
      console.error('Failed to process event image upload:', error);
      throw new BadRequestException(
        `Failed to process event image: ${error.message}`,
      );
    }
  }
  async processEventImageUploadV5(
    image: Express.Multer.File,
    lat?: number,
    lon?: number,
    userId?: string,
  ): Promise<Event> {
    console.info('[EventService] Processing new event (v5)');
    try {
      // 1. Upload image and get URL
      const uploadedImageUrl = await this.imageService.uploadImage(image);
      if (!uploadedImageUrl) {
        throw new BadRequestException('Failed to upload image');
      }

      // 2. Try to extract event data from image, but don't fail if it doesn't work
      let extractedEventData = {};
      try {
        extractedEventData =
          await this.chatGptService.extractEventFromFlyer(uploadedImageUrl);
      } catch (error) {
        console.warn('Failed to extract event data from image:', error);
      }

      const profile = await this.profileService.getProfileByUserId(userId);
      const hostImageUrl = profile.profileImageUrl;

      // 4. Create event with all available data
      const eventData = {
        ...extractedEventData,
        imageUrl: uploadedImageUrl,
        uploadLat: lat,
        uploadLon: lon,
        createdAt: new Date(),
        updatedAt: new Date(),
        location: {
          coordinates: {
            lat: lat,
            lon: lon,
          },
        },
        status: 'pending',
        hostId: userId || 'public', // Setze hostId auf userId wenn vorhanden, sonst 'public'
        host: {
          profileImageUrl: hostImageUrl || undefined,
          username: profile.username || undefined,
        },
      };

      const createdEvent = await this.eventRepository.create(eventData);
      await this.profileService.addCreatedEvent(userId, createdEvent.id);
      await this.userService.addUserPoints(userId, 20);

      // Add feed item to feed
      await this.feedService.pushFeedItemFromEvent(createdEvent, 'event');
      return createdEvent;
    } catch (error) {
      console.error('Failed to process event image upload:', error);
      throw new BadRequestException(
        `Failed to process event image: ${error.message}`,
      );
    }
  }

  async processEventImage(
    imageUrl: string,
    lat?: number,
    lon?: number,
  ): Promise<any> {
    // Implementiere die Bildverarbeitung
    throw new BadRequestException('Not implemented yet');
  }

  async searchEvents(params: {
    query?: string;
    city?: string;
    dateRange?: { startDate: string; endDate: string };
  }): Promise<Event[]> {
    return this.eventRepository.searchEvents(params);
  }

  async findByHostId(
    hostId: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<Event[]> {
    return this.eventRepository.findByHostId(hostId, skip, limit);
  }

  async findBySlug(
    slug: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<Event> {
    const isObjectId = /^[a-f\d]{24}$/i.test(slug); // MongoDB ID Check

    // User ermitteln
    const user = isObjectId
      ? await this.userService.findById(slug)
      : await this.userService.findByUsername(slug);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.eventRepository.findBySlug(slug, skip, limit);
  }

  async findEventsByHost(username: string): Promise<Event[]> {
    return this.eventRepository.findByHostUsername(username);
  }

  async findEventsByHostV2(username: string): Promise<Event[]> {
    return this.eventRepository.findByHostUsernameFullMeta(username);
  }

  async findByCity(
    city: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<Event[]> {
    return this.eventRepository.findByCity(city, skip, limit);
  }

  async countByCity(city: string): Promise<number> {
    return this.eventRepository.countByCity(city);
  }

  async getPopularCities(
    limit: number = 10,
  ): Promise<{ city: string; count: number }[]> {
    return this.eventRepository.getPopularCities(limit);
  }

  async countByHostId(hostId: string): Promise<number> {
    return this.eventRepository.countByHostId(hostId);
  }

  private toEntity(event: any): Event {
    // Implementiere die Umwandlung von event-formatierten Daten in ein Event-Objekt
    throw new Error('Method not implemented');
  }

  // Embedding ----------------------------------------------------

  updateEmbedding(id: any, embedding: number[]) {
    return this.eventRepository.updateEmbedding(id, embedding);
  }
  findMissingEmbeddings(batchSize: number) {
    return this.eventRepository.findMissingEmbeddings(batchSize);
  }

  async findAndCountBySlug(
    slug: string,
  ): Promise<{ events: Event[]; total: number }> {
    const isObjectId = /^[a-f\d]{24}$/i.test(slug);

    let userId = null;
    let userName = null;

    if (isObjectId) {
      const user = await this.userService.findById(slug);
      userId = slug;
      userName = user.username;
    } else {
      userName = slug;
    }

    const { events, total } =
      await this.eventRepository.findAndCountByHostUsername(userName, userId);

    return { events, total };
  }

  async findAndCountBySlugV2(
    slug: string,
  ): Promise<{ events: Event[]; total: number }> {
    const isObjectId = /^[a-f\d]{24}$/i.test(slug);

    let userId = null;
    let userName = null;

    if (isObjectId) {
      const user = await this.userService.findById(slug);
      userId = slug;
      userName = user.username;
    } else {
      userName = slug;
    }

    const { events, total } =
      await this.eventRepository.findAndCountByHostUsernameV2(userName, userId);

    return { events, total };
  }

  async uploadLineupPictures(
    eventId: string,
    image: Express.Multer.File,
    id: any,
  ) {
    console.log('uploadLineupPictures', eventId, image, id);
    const imageUrl = await this.imageService.uploadImage(image);

    const event = await this.eventRepository.uploadLineupPictures(
      eventId,
      [imageUrl],
      id,
    );
    await this.chatGptService
      .extractLineUpFromFlyer(imageUrl, event.lineup)
      .then((lineUp) => {
        this.eventRepository.updateLineupFromImage(eventId, lineUp);
      });
    void this.feedService.pushFeedItemFromEventPictures(event, 'lineup', [
      imageUrl,
    ]);
    return event;
  }

  async updateEventFromPrompt(userId: string, eventId: string, prompt: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.hostId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this event',
      );
    }
    // extract event from prompt
    const eventFromPrompt: UpdateEventDto =
      await this.chatGptService.extractEventFromPrompt(prompt, event);
    console.log('eventFromPrompt', eventFromPrompt);

    // update event with eventFromPrompt
    return await this.eventRepository.updateFromPrompt(
      eventId,
      eventFromPrompt,
    );

    // return this.eventRepository.updateEventFromPrompt(eventId, prompt);
  }

  async updateEventFromPromptV2(userId: string, eventId: string, prompt: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.hostId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this event',
      );
    }
    // extract event from prompt
    const eventFromPrompt: UpdateEventDto =
      await this.chatGptService.extractEventFromPrompt(prompt, event);
    console.log('eventFromPrompt', eventFromPrompt);

    const detailedEventDescription = await this.chatGptService.generateDetailedEventDescription(event);
    console.log('detailedEventDescription', detailedEventDescription);

    // update event with eventFromPrompt
    return await this.eventRepository.updateFromPromptV2( 
      eventId,
      eventFromPrompt,
      detailedEventDescription,
    );
  }

  async updateEventImage(
    eventId: string,
    image: Express.Multer.File,
    userId: string,
  ) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (userId !== event.hostId) {
      throw new UnauthorizedException(
        'You are not authorized to update this event',
      );
    }
    const imageUrl = await this.imageService.uploadImage(image);
    return this.eventRepository.updateEventImage(eventId, imageUrl);
  }

  createSponsoredEvent(eventId: string, sponsored: boolean, sub: any) {
    return this.eventRepository.createSponsoredEvent(eventId, sponsored, sub);
  }

  // deleteLineupPicture(id: string, userId: string) {
  //   return this.eventRepository.deleteLineupPicture(id, userId);
  // }

  // ------------------------------------------------------------
  // Register Event
  // ------------------------------------------------------------
  async registerEvent(eventId: string, userId: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const user = await this.userService.registerForEvent(eventId, userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const registeredEvent = await this.eventRepository.registerEvent(
      eventId,
      userId,
    );

    console.log('registeredEvent', registeredEvent);

    return registeredEvent;
  }
  async unregisterEvent(eventId: string, userId: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.eventRepository.unregisterEvent(eventId, userId);
  }

  async getRegisteredEvents(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.eventRepository.findRegisteredEvents(userId);
  }

  // ------------------------------------------------------------
  // Invite 2 Event
  // ------------------------------------------------------------
  async inviteToEvent(eventId: string, userId: string, id: any) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.eventRepository.inviteToEvent(eventId, userId, id);
  }
  async getInvitesEvents(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.eventRepository.findInvitesEvents(userId);
  }

  async acceptInvite(eventId: string, userId: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return this.eventRepository.acceptInvite(eventId, userId);
  }

  // ------------------------------------------------------------
  // Validators
  // ------------------------------------------------------------

  async addValidatorToEvent(id: string, sub: any) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.hostId !== sub) {
      throw new UnauthorizedException(
        'You are not authorized to add a validator to this event',
      );
    }
    return this.eventRepository.addValidatorToEvent(id, sub);
  }

  async removeValidatorFromEvent(id: string, sub: any) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.hostId !== sub) {
      throw new UnauthorizedException(
        'You are not authorized to remove a validator from this event',
      );
    }
    return this.eventRepository.removeValidatorFromEvent(id, sub);
  }

  async getEventValidators(id: string, sub: any) {
    const { validators, hostId } =
      await this.eventRepository.getEventValidators(id);
    if (!validators) {
      throw new NotFoundException('Validators not found');
    }
    if (hostId !== sub) {
      throw new UnauthorizedException(
        'You are not authorized to get the validators of this event',
      );
    }
    // get Profile Image and Username for each validator
    const validatorsProfiles = await Promise.all(
      validators.map(async (validator: any) => {
        const { username, profileImageUrl } =
          await this.userService.getUsernameAndProfilePicture(validator);
        return {
          id: validator,
          username: username,
          imageUrl: profileImageUrl,
        };
      }),
    );
    return validatorsProfiles;
  }

  // ------------------------------------------------------------
  // Connect with Event Member
  // ------------------------------------------------------------
  // async connectWithEventMember(eventId: string, userId: string) {
  //   const event = await this.eventRepository.findById(eventId);
  //   if (!event) {
  //     throw new NotFoundException('Event not found');
  //   }
  //   return this.eventRepository.connectWithEventMember(eventId, userId);
  // }

  // ------------------------------------------------------------
  // CREATE EVENT FULL
  // ------------------------------------------------------------
  async createEventFull(
    body: CreateFullEventDto,
    userId: string,
    image?: Express.Multer.File,
  ) {
    const profile = await this.profileService.getProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    let imageUrl: string | undefined;

    // Wenn ein Bild vorhanden ist → hochladen
    if (image) {
      try {
        // Hier erwartest du, dass dein ImageService z. B. die Datei in S3, Cloudinary, etc. hochlädt
        imageUrl = await this.imageService.uploadImage(image);
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }

    // Eventdaten vorbereiten
    const eventData = {
      ...body,
      hostId: userId,
      ...(imageUrl && { imageUrl }), // oder image: imageUrl, falls du das Feld gleich halten willst
    };

    // Permission check for Community Events
    if (eventData.communityId) {
      const hasPermission = await this.communityService.checkUserCanCreateEvent(
        eventData.communityId,
        userId,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          'Only moderators and admins can create community events',
        );
      }
    }

    const newEvent = await this.eventRepository.createEventFull(eventData, userId);

    // Auto-Link to Community if communityId is present
    if (newEvent.communityId) {
      try {
        await this.communityService.addEventToCommunity(newEvent.communityId, newEvent.id);
      } catch (error) {
        // Rollback: Delete event if community linking fails
        await this.eventRepository.delete(newEvent.id);
        throw new BadRequestException(
          `Failed to link event to community: ${error.message}`,
        );
      }
    }

    return newEvent;
  }

  async createSubevent(
    parentEventId: string,
    eventData: any,
    userId: string,
    image?: Express.Multer.File,
  ) {
    // Verify parent event exists
    const parentEvent = await this.eventRepository.findById(parentEventId);
    if (!parentEvent) {
      throw new NotFoundException('Parent event not found');
    }

    // Verify user is the host of the parent event
    if (parentEvent.hostId !== userId) {
      throw new ForbiddenException('Only the event host can create subevents');
    }

    // Add parentEventId to event data
    eventData.parentEventId = parentEventId;

    // If no image is provided, use parent event's image
    if (!image && parentEvent.imageUrl) {
      eventData.imageUrl = parentEvent.imageUrl;
    }

    // Create the subevent using existing createEvent method
    const subevent = await this.createEvent(eventData, image);

    return subevent;
  }

  async getSubevents(eventId: string) {
    // Verify parent event exists
    const parentEvent = await this.eventRepository.findById(eventId);
    if (!parentEvent) {
      throw new NotFoundException('Event not found');
    }

    // Find all events where parentEventId matches the given eventId
    const subevents = await this.eventRepository.findByParentEventId(eventId);

    return subevents;
  }

  async getSubevent(parentEventId: string, subeventId: string) {
    // Verify parent event exists
    const parentEvent = await this.eventRepository.findById(parentEventId);
    if (!parentEvent) {
      throw new NotFoundException('Parent event not found');
    }

    // Get the subevent
    const subevent = await this.eventRepository.findById(subeventId);
    if (!subevent) {
      throw new NotFoundException('Subevent not found');
    }

    // Verify it's actually a subevent of the specified parent
    if (subevent.parentEventId !== parentEventId) {
      throw new BadRequestException(
        'Subevent does not belong to the specified parent event',
      );
    }

    return subevent;
  }


}
