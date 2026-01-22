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
import { SlugService } from 'src/infrastructure/services/slug.service';
import { AiEnrichmentService } from 'src/infrastructure/services/ai-enrichment.service';
import { CreateFullEventDto } from 'src/presentation/dtos/create-full-event.dto';
import { MapEventDto } from 'src/presentation/dtos/map-event.dto';
import { UpdateEventDto } from 'src/presentation/dtos/update-event.dto';
import { Event, EventWithHost } from '../../core/domain/event';
import { MongoEventRepository } from '../../infrastructure/repositories/mongodb/event.repository';
import { ImageService } from '../../infrastructure/services/image.service';
import { DocumentService } from '../../infrastructure/services/document.service';
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
    private readonly documentService: DocumentService,
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
    private readonly slugService: SlugService,
    private readonly aiEnrichmentService: AiEnrichmentService,
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
        const eventData: any = {
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


  // ----------------------------------------------------------------------------
  // SEARCH EVENTS VECTOR BASED -------------------------------------------------
  // ----------------------------------------------------------------------------
  async findFindPopularVectorBased(limit: number) {
    const events = await this.eventRepository.findAllWithEmbedding(limit);
    return events;
  }

  findFindPopularUserBasedHome(id: any) {
    throw new Error('Method not implemented.');
  }

  /**
   * Gibt beliebte Events mit Vector-basierter Suche zurück
   * @param query - Optional: Suchtext für Vector-Suche
   * @param isUpcoming - true für kommende Events, false für vergangene, undefined für alle
   * @param limit - Anzahl der zurückzugebenden Events
   */
  async getPopularEventsVectorBased(
    query?: string,
    isUpcoming?: boolean,
    limit: number = 20,
  ) {
    const now = new Date();
    const nowTimestamp = Math.floor(now.getTime() / 1000);

    // Filter für Datum basierend auf isUpcoming
    const dateFilter: any = {};
    if (isUpcoming !== undefined) {
      if (isUpcoming) {
        // Nur kommende Events (startDate >= jetzt)
        dateFilter.must = [
          {
            key: 'start_time',
            range: {
              gte: nowTimestamp,
            },
          },
        ];
      } else {
        // Nur vergangene Events (startDate < jetzt)
        dateFilter.must = [
          {
            key: 'start_time',
            range: {
              lt: nowTimestamp,
            },
          },
        ];
      }
    }

    // Filter für Popularität (nur Events mit popularity > 0)
    const popularityFilter = {
      key: 'popularity',
      range: {
        gt: 0,
      },
    };

    if (dateFilter.must) {
      dateFilter.must.push(popularityFilter);
    } else {
      dateFilter.must = [popularityFilter];
    }

    let searchVector: number[] | undefined;

    // Wenn Query vorhanden, erstelle Embedding
    if (query && query.trim()) {
      try {
        searchVector = await this.chatGptService.createEmbeddingV2(query);
      } catch (error) {
        console.error('Failed to create embedding for query:', error);
        // Fallback: ohne Vector-Suche, nur nach Popularität
      }
    }

    if (searchVector) {
      // Vector-basierte Suche mit Popularitäts- und Datumsfilter
      const searchResults = await this.qdrantService.searchEventsSimilar({
        vector: searchVector,
        limit,
        filter: dateFilter,
        withPayload: true,
      });

      // Extrahiere Event-IDs aus den Ergebnissen
      const eventIds = searchResults
        .map((hit) => this.extractEventIdFromPayload(hit.payload))
        .filter((id): id is string => Boolean(id));

      if (eventIds.length === 0) {
        return [];
      }

      // Lade Events aus der Datenbank
      const events = await Promise.all(
        eventIds.map((id) => this.eventRepository.findById(id)),
      );

      return events.filter((event): event is Event => event !== null);
    } else {
      // Fallback: Lade Events direkt aus DB und filtere nach Datum
      const allEvents = await this.eventRepository.findAllWithEmbedding(limit * 2);
      const filteredEvents = allEvents.filter((event) => {
        if (!event.startDate) return false;
        const eventDate = new Date(event.startDate);
        if (isUpcoming === true) {
          return eventDate >= now;
        } else if (isUpcoming === false) {
          return eventDate < now;
        }
        return true;
      });

      // Sortiere nach Popularität (falls vorhanden) und begrenze
      return filteredEvents.slice(0, limit);
    }
  }

  /**
   * Vector-basierte Suche nach Events mit Query-Text
   * @param query - Suchtext für Vector-Suche
   * @param isUpcoming - true für kommende Events, false für vergangene, undefined für alle
   * @param limit - Anzahl der zurückzugebenden Events
   */
  async searchEventsWithQueryVector(
    query: string,
    isUpcoming?: boolean,
    limit: number = 20,
  ) {
    if (!query || !query.trim()) {
      throw new BadRequestException('Query parameter is required');
    }

    const now = new Date();
    const nowTimestamp = Math.floor(now.getTime() / 1000);

    // Filter für Datum basierend auf isUpcoming
    const dateFilter: any = {};
    if (isUpcoming !== undefined) {
      if (isUpcoming) {
        // Nur kommende Events
        dateFilter.must = [
          {
            key: 'start_time',
            range: {
              gte: nowTimestamp,
            },
          },
        ];
      } else {
        // Nur vergangene Events
        dateFilter.must = [
          {
            key: 'start_time',
            range: {
              lt: nowTimestamp,
            },
          },
        ];
      }
    }

    // Erstelle Embedding für den Query-Text
    let searchVector: number[];
    try {
      searchVector = await this.chatGptService.createEmbeddingV2(query);
    } catch (error) {
      console.error('Failed to create embedding for query:', error);
      throw new BadRequestException('Failed to process search query');
    }

    // Führe Vector-Suche durch
    const searchResults = await this.qdrantService.searchEventsSimilar({
      vector: searchVector,
      limit,
      filter: dateFilter.must ? dateFilter : undefined,
      withPayload: true,
    });

    // Extrahiere Event-IDs aus den Ergebnissen
    const eventIds = searchResults
      .map((hit) => this.extractEventIdFromPayload(hit.payload))
      .filter((id): id is string => Boolean(id));

    if (eventIds.length === 0) {
      return [];
    }

    // Lade Events aus der Datenbank
    const events = await Promise.all(
      eventIds.map((id) => this.eventRepository.findById(id)),
    );

    return events.filter((event): event is Event => event !== null);
  }

  /**
   * Vector-basierte Suche mit erweiterten Filtern
   * @param filters - Filter-Objekt mit allen optionalen Filtern
   */
  async searchEventsWithVectorFilters(filters: {
    query?: string;
    limit?: number;
    isUpcoming?: boolean;
    minAge?: number;
    maxAge?: number;
    region?: string;
    city?: string;
    lat?: number;
    lon?: number;
    maxDistanceKm?: number;
    musik?: {
      types?: ('live' | 'DJ' | 'Genre')[];
      genre?: string;
    };
    category?: 'Kunst / Kultur' | 'Networking / Business' | 'Lernen / Talks' | 'Party / Nachtleben' | 'Natur / Outdoor' | 'Experimentell / ungewöhnlich';
    categories?: string[];
    genres?: string[];
    tags?: string[];
    maxPrice?: number;
    pricingType?: 'free' | 'donation' | 'paid' | 'subscription';
    dateFrom?: string;
    dateTo?: string;
    timeFrom?: string;
    timeTo?: string;
    weekdays?: string[];
    avoidLoud?: boolean;
    avoidAlcohol?: boolean;
    avoidCrowds?: boolean;
    avoidPolitical?: boolean;
    avoidLongDuration?: boolean;
    avoidTags?: string[];
    maxLoudnessLevel?: number;
    maxCrowdLevel?: number;
    foodAvailable?: boolean;
    veganAvailable?: boolean;
    indoor?: boolean;
    outdoor?: boolean;
    online?: boolean;
    accessibility?: string[];
    language?: string;
    maxEnergyLevel?: number;
    vibeTags?: string[];
    boostToday?: boolean;
    boostWeekend?: boolean;
  }) {
    const {
      query,
      limit = 20,
      isUpcoming,
      region,
      city,
      lat,
      lon,
      maxDistanceKm,
      musik,
      category,
      categories,
      genres,
      tags,
      maxPrice,
      pricingType,
      dateFrom,
      dateTo,
      timeFrom,
      timeTo,
      weekdays,
      avoidLoud,
      avoidAlcohol,
      avoidCrowds,
      avoidPolitical,
      avoidLongDuration,
      avoidTags,
      maxLoudnessLevel,
      maxCrowdLevel,
      foodAvailable,
      veganAvailable,
      indoor,
      outdoor,
      online,
      accessibility,
      language,
      maxEnergyLevel,
      vibeTags,
      boostToday,
      boostWeekend,
    } = filters;

    const now = new Date();
    const nowTimestamp = Math.floor(now.getTime() / 1000);

    // Baue Filter für Qdrant auf
    const filterClauses: Array<Record<string, any>> = [];

    // Datum-Filter
    if (isUpcoming !== undefined) {
      if (isUpcoming) {
        filterClauses.push({
          key: 'start_time',
          range: {
            gte: nowTimestamp,
          },
        });
      } else {
        filterClauses.push({
          key: 'start_time',
          range: {
            lt: nowTimestamp,
          },
        });
      }
    }

    // Region/City-Filter
    if (city) {
      filterClauses.push({
        key: 'city',
        match: { value: city },
      });
    } else if (region) {
      // Region könnte mehrere Städte umfassen, daher als Text-Suche
      filterClauses.push({
        key: 'city',
        match: { text: region },
      });
    }

    // Kategorie-Filter
    if (category) {
      filterClauses.push({
        key: 'category',
        match: { value: category },
      });
    }

    // Musik-Filter
    if (musik) {
      if (musik.types && musik.types.length > 0) {
        // Filter nach roles (live, DJ)
        const roleTypes = musik.types.filter((type) => type === 'live' || type === 'DJ');
        
        if (roleTypes.length > 0) {
          // Wenn mehrere Rollen, verwende "should" (OR) - Qdrant unterstützt should auf oberster Ebene
          if (roleTypes.length === 1) {
            filterClauses.push({
              key: 'roles',
              match: { value: roleTypes[0] },
            });
          } else {
            // Für mehrere Rollen: sollte in einem should-Block sein
            // Da Qdrant-Filter-Struktur komplex ist, verwenden wir einen alternativen Ansatz
            // Filtere nach der ersten Rolle und lasse die anderen über die Datenbank-Filterung
            filterClauses.push({
              key: 'roles',
              match: { any: roleTypes },
            });
          }
        }

        // Genre-Filter über tags
        if (musik.genre) {
          filterClauses.push({
            key: 'tags',
            match: { text: musik.genre },
          });
        } else if (musik.types.includes('Genre')) {
          // Wenn "Genre" ausgewählt, aber kein spezifisches Genre, filtere nach Musik-Tags
          filterClauses.push({
            key: 'tags',
            match: { any: ['music', 'musik', 'konzert', 'concert', 'festival'] },
          });
        }
      } else if (musik.genre) {
        // Nur Genre ohne Types
        filterClauses.push({
          key: 'tags',
          match: { text: musik.genre },
        });
      }
    }

    // Zusätzliche Qdrant-Filter
    if (categories && categories.length > 0) {
      filterClauses.push({
        key: 'category',
        match: { any: categories },
      });
    }

    if (genres && genres.length > 0) {
      filterClauses.push({
        key: 'tags',
        match: { any: genres },
      });
    }

    if (tags && tags.length > 0) {
      filterClauses.push({
        key: 'tags',
        match: { any: tags },
      });
    }

    // Datum-Filter (dateFrom, dateTo)
    if (dateFrom || dateTo) {
      const fromTimestamp = dateFrom
        ? Math.floor(new Date(dateFrom).getTime() / 1000)
        : undefined;
      const toTimestamp = dateTo
        ? Math.floor(new Date(dateTo).getTime() / 1000)
        : undefined;

      const dateRangeFilter: any = { key: 'start_time', range: {} };
      if (fromTimestamp !== undefined) {
        dateRangeFilter.range.gte = fromTimestamp;
      }
      if (toTimestamp !== undefined) {
        dateRangeFilter.range.lte = toTimestamp;
      }
      if (Object.keys(dateRangeFilter.range).length > 0) {
        filterClauses.push(dateRangeFilter);
      }
    }

    const qdrantFilter =
      filterClauses.length > 0 ? { must: filterClauses } : undefined;

    // Erstelle Embedding für Query (falls vorhanden)
    let searchVector: number[] | undefined;
    if (query && query.trim()) {
      try {
        searchVector = await this.chatGptService.createEmbeddingV2(query);
      } catch (error) {
        console.error('Failed to create embedding for query:', error);
        // Fallback: ohne Vector-Suche
      }
    }

    if (searchVector) {
      // Vector-basierte Suche
      const searchResults = await this.qdrantService.searchEventsSimilar({
        vector: searchVector,
        limit,
        filter: qdrantFilter,
        withPayload: true,
      });

      const eventIds = searchResults
        .map((hit) => this.extractEventIdFromPayload(hit.payload))
        .filter((id): id is string => Boolean(id));

      if (eventIds.length === 0) {
        return [];
      }

      const events = await Promise.all(
        eventIds.map((id) => this.eventRepository.findById(id)),
      );

      // Zusätzliche Filterung nach Events, die nicht in Qdrant gespeichert sind
      return this.applyAdvancedFilters(
        events.filter((event): event is Event => event !== null),
        filters,
        now,
      );
    } else {
      // Fallback: Suche ohne Vector (nur Filter)
      // Da Qdrant keine reine Filter-Suche ohne Vector unterstützt,
      // müssen wir über die Datenbank suchen
      const allEvents = await this.eventRepository.findAllWithEmbedding(
        limit * 3,
      );

      // Filtere Events nach den Kriterien
      let filteredEvents = this.applyAdvancedFilters(allEvents, filters, now);
      return filteredEvents.slice(0, limit);
    }
  }

  /**
   * Wendet erweiterte Filter auf Events an (nach Qdrant-Suche oder als Fallback)
   */
  private applyAdvancedFilters(
    events: Event[],
    filters: {
      isUpcoming?: boolean;
      region?: string;
      city?: string;
      lat?: number;
      lon?: number;
      maxDistanceKm?: number;
      musik?: {
        types?: ('live' | 'DJ' | 'Genre')[];
        genre?: string;
      };
      category?: string;
      categories?: string[];
      genres?: string[];
      tags?: string[];
      maxPrice?: number;
      pricingType?: 'free' | 'donation' | 'paid' | 'subscription';
      dateFrom?: string;
      dateTo?: string;
      timeFrom?: string;
      timeTo?: string;
      weekdays?: string[];
      avoidLoud?: boolean;
      avoidAlcohol?: boolean;
      avoidCrowds?: boolean;
      avoidPolitical?: boolean;
      avoidLongDuration?: boolean;
      avoidTags?: string[];
      maxLoudnessLevel?: number;
      maxCrowdLevel?: number;
      foodAvailable?: boolean;
      veganAvailable?: boolean;
      indoor?: boolean;
      outdoor?: boolean;
      online?: boolean;
      accessibility?: string[];
      language?: string;
      maxEnergyLevel?: number;
      vibeTags?: string[];
    },
    now: Date,
  ): Event[] {
    return events.filter((event) => {
      // Datum-Filter
      if (filters.isUpcoming !== undefined && event.startDate) {
        const eventDate = new Date(event.startDate);
        if (filters.isUpcoming && eventDate < now) return false;
        if (!filters.isUpcoming && eventDate >= now) return false;
      }

      // Datum-Range-Filter
      if (filters.dateFrom || filters.dateTo) {
        if (!event.startDate) return false;
        const eventDate = new Date(event.startDate);
        if (filters.dateFrom && eventDate < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && eventDate > new Date(filters.dateTo)) return false;
      }

      // Zeit-Filter
      if (filters.timeFrom || filters.timeTo) {
        if (!event.startTime) return false;
        const [hours, minutes] = event.startTime.split(':').map(Number);
        const eventTime = hours * 60 + minutes;
        if (filters.timeFrom) {
          const [fromHours, fromMinutes] = filters.timeFrom.split(':').map(Number);
          const fromTime = fromHours * 60 + fromMinutes;
          if (eventTime < fromTime) return false;
        }
        if (filters.timeTo) {
          const [toHours, toMinutes] = filters.timeTo.split(':').map(Number);
          const toTime = toHours * 60 + toMinutes;
          if (eventTime > toTime) return false;
        }
      }

      // Wochentag-Filter
      if (filters.weekdays && filters.weekdays.length > 0 && event.startDate) {
        const eventDate = new Date(event.startDate);
        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const eventDay = dayNames[eventDate.getDay()];
        if (!filters.weekdays.includes(eventDay)) return false;
      }

      // City/Region-Filter
      if (filters.city && event.city?.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }
      if (filters.region && event.city && !event.city.toLowerCase().includes(filters.region.toLowerCase())) {
        return false;
      }

      // Geo-Distanz-Filter
      if (filters.lat && filters.lon && filters.maxDistanceKm && event.uploadLat && event.uploadLon) {
        const distance = this.calculateDistance(
          filters.lat,
          filters.lon,
          event.uploadLat,
          event.uploadLon,
        );
        if (distance > filters.maxDistanceKm) return false;
      }

      // Kategorie-Filter
      if (filters.category && event.category !== filters.category) {
        return false;
      }
      if (filters.categories && filters.categories.length > 0) {
        if (!event.category || !filters.categories.includes(event.category)) {
          return false;
        }
      }

      // Genres/Tags-Filter
      if (filters.genres && filters.genres.length > 0) {
        const hasGenre = event.tags?.some((tag) =>
          filters.genres!.some((genre) =>
            tag.toLowerCase().includes(genre.toLowerCase()),
          ),
        );
        if (!hasGenre) return false;
      }

      if (filters.tags && filters.tags.length > 0) {
        const hasTag = event.tags?.some((tag) =>
          filters.tags!.some((filterTag) =>
            tag.toLowerCase().includes(filterTag.toLowerCase()),
          ),
        );
        if (!hasTag) return false;
      }

      // Preis-Filter
      if (filters.maxPrice !== undefined) {
        const eventPrice = event.price ? parseFloat(String(event.price)) : undefined;
        if (eventPrice !== undefined && eventPrice > filters.maxPrice) {
          return false;
        }
      }

      if (filters.pricingType) {
        const eventPrice = event.price ? parseFloat(String(event.price)) : undefined;
        if (filters.pricingType === 'free' && eventPrice !== 0 && eventPrice !== undefined) {
          return false;
        }
        if (filters.pricingType === 'paid' && (eventPrice === 0 || eventPrice === undefined)) {
          return false;
        }
      }

      // Musik-Filter
      if (filters.musik) {
        if (filters.musik.types && filters.musik.types.length > 0) {
          const hasMatchingRole = filters.musik.types.some((type) => {
            if (type === 'live' || type === 'DJ') {
              return event.lineup?.some((item) =>
                item.role?.toLowerCase().includes(type.toLowerCase()),
              );
            }
            return false;
          });

          if (!hasMatchingRole && filters.musik.types.some((t) => t === 'live' || t === 'DJ')) {
            return false;
          }

          if (filters.musik.genre) {
            const hasGenre =
              event.tags?.some((tag) =>
                tag.toLowerCase().includes(filters.musik!.genre!.toLowerCase()),
              ) || false;
            if (!hasGenre) return false;
          }
        } else if (filters.musik.genre) {
          const hasGenre =
            event.tags?.some((tag) =>
              tag.toLowerCase().includes(filters.musik!.genre!.toLowerCase()),
            ) || false;
          if (!hasGenre) return false;
        }
      }

      // No-Go Filter (ausschließen)
      if (filters.avoidTags && filters.avoidTags.length > 0) {
        const hasAvoidedTag = event.tags?.some((tag) =>
          filters.avoidTags!.some((avoidTag) =>
            tag.toLowerCase().includes(avoidTag.toLowerCase()),
          ),
        );
        if (hasAvoidedTag) return false;
      }

      // Vermeide laut (über Tags oder Kategorie)
      if (filters.avoidLoud) {
        const loudTags = ['loud', 'laut', 'noise', 'party', 'club', 'konzert'];
        const hasLoudTag = event.tags?.some((tag) =>
          loudTags.some((loud) => tag.toLowerCase().includes(loud)),
        );
        if (hasLoudTag || event.category?.toLowerCase().includes('party')) {
          return false;
        }
      }

      // Vermeide Alkohol (über Tags)
      if (filters.avoidAlcohol) {
        const alcoholTags = ['alcohol', 'alkohol', 'bar', 'drinks', 'cocktail'];
        const hasAlcoholTag = event.tags?.some((tag) =>
          alcoholTags.some((alc) => tag.toLowerCase().includes(alc)),
        );
        if (hasAlcoholTag) return false;
      }

      // Vermeide Menschenmengen (über Tags oder Kategorie)
      if (filters.avoidCrowds) {
        const crowdTags = ['crowd', 'massen', 'festival', 'groß', 'large'];
        const hasCrowdTag = event.tags?.some((tag) =>
          crowdTags.some((crowd) => tag.toLowerCase().includes(crowd)),
        );
        if (hasCrowdTag || (event.capacity && event.capacity > 500)) {
          return false;
        }
      }

      // Vermeide politisch/religiös (über Tags oder Kategorie)
      if (filters.avoidPolitical) {
        const politicalTags = ['political', 'politik', 'religion', 'religiös', 'demo'];
        const hasPoliticalTag = event.tags?.some((tag) =>
          politicalTags.some((pol) => tag.toLowerCase().includes(pol)),
        );
        if (hasPoliticalTag) return false;
      }

      // Vermeide lange Dauer (über endDate)
      if (filters.avoidLongDuration && event.startDate && event.endDate) {
        const duration = new Date(event.endDate).getTime() - new Date(event.startDate).getTime();
        const hours = duration / (1000 * 60 * 60);
        if (hours > 6) return false; // Mehr als 6 Stunden
      }

      // Language-Filter
      if (filters.language && event.language && event.language !== filters.language) {
        return false;
      }

      // Accessibility-Filter
      if (filters.accessibility && filters.accessibility.length > 0) {
        // Prüfe über Tags (z.B. 'wheelchair', 'barrierefrei')
        const hasAccessibility = filters.accessibility.some((acc) =>
          event.tags?.some((tag) => tag.toLowerCase().includes(acc.toLowerCase())),
        );
        // Wenn explizit gesucht wird, aber nicht gefunden, ausschließen
        // (kann später erweitert werden, wenn Events ein accessibility-Feld haben)
      }

      return true;
    });
  }

  /**
   * Berechnet die Distanz zwischen zwei Geo-Koordinaten in Kilometern (Haversine-Formel)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Erdradius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  // ----------------------------------------------------------------------------
  // END SEARCH EVENTS VECTOR BASED ---------------------------------------------
  // ----------------------------------------------------------------------------

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

  /**
   * Findet ein Event anhand von ID oder Slug
   * Unterstützt beide Formate:
   * - "abc123" (nur ID)
   * - "techno-party-berlin-2024-abc123" (Slug-ID)
   */
  async findEventByIdentifier(identifier: string): Promise<Event | null> {
    // Prüfe ob es eine Slug-URL ist (enthält Bindestriche und endet mit ID)
    const slugMatch = identifier.match(/^(.+)-([a-f0-9]{24})$/);
    
    if (slugMatch) {
      // Slug-Format: slug-id
      const [, slug, id] = slugMatch;
      return this.eventRepository.findBySlugAndId(slug, id);
    } else {
      // Altes Format: nur ID
      return this.eventRepository.findById(identifier);
    }
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

  /**
   * Fügt Dokumente zu einem Event hinzu
   * 
   * @param eventId - Die ID des Events
   * @param documents - Array von hochgeladenen Dokumenten
   * @param userId - Die ID des Users (für Authorization)
   * @returns Das aktualisierte Event
   */
  async addDocumentsToEvent(
    eventId: string,
    documents: Express.Multer.File[],
    userId: string,
  ) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.hostId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to add documents to this event',
      );
    }

    // Lade Dokumente hoch
    const documentUrls = await this.documentService.uploadDocuments(documents);

    // Füge Dokumente zum Event hinzu (verwende $push für bessere Performance)
    await this.eventRepository.uploadEventDocuments(eventId, documentUrls);

    const updatedEvent = await this.eventRepository.findById(eventId);
    return updatedEvent;
  }

  /**
   * Entfernt ein Dokument von einem Event
   * 
   * @param eventId - Die ID des Events
   * @param documentUrl - Die URL des zu entfernenden Dokuments
   * @param userId - Die ID des Users (für Authorization)
   * @returns Das aktualisierte Event
   */
  async removeDocumentFromEvent(
    eventId: string,
    documentUrl: string,
    userId: string,
  ) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.hostId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to remove documents from this event',
      );
    }

    const currentDocuments = event.documents || [];
    const updatedDocuments = currentDocuments.filter(
      (doc) => doc !== documentUrl,
    );

    await this.eventRepository.update(eventId, { documents: updatedDocuments });

    const updatedEvent = await this.eventRepository.findById(eventId);
    return updatedEvent;
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
      const eventWithImage: any = {
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

      // Slug-Generierung (falls nicht vorhanden)
      if (!(eventWithImage as any).slug && eventWithImage.title && eventWithImage.city && eventWithImage.startDate) {
        const slugs = await this.slugService.generateSlugsForEvent({
          title: eventWithImage.title,
          city: eventWithImage.city,
          startDate: eventWithImage.startDate,
          category: eventWithImage.category,
          slug: (eventWithImage as any).slug,
          citySlug: (eventWithImage as any).citySlug,
          categorySlug: (eventWithImage as any).categorySlug,
        });
        Object.assign(eventWithImage, slugs);
      }

      // KI-Anreicherung (optional, graceful degradation)
      try {
        const enriched = this.aiEnrichmentService.enrichEvent({
          title: eventWithImage.title,
          description: eventWithImage.description,
          category: eventWithImage.category,
          city: eventWithImage.city,
        });
        Object.assign(eventWithImage, enriched);
      } catch (error) {
        console.error('KI-Anreicherung fehlgeschlagen:', error);
        // Event wird trotzdem gespeichert
      }

      // Status setzen (falls nicht vorhanden)
      if (!(eventWithImage as any).status) {
        (eventWithImage as any).status = 'published';
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

  async toggleCommentsEnabled(eventId: string, hostId: string): Promise<Event | null> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.hostId !== hostId) {
      throw new ForbiddenException('Only the event host can toggle comments');
    }
    
    const newStatus = !(event.commentsEnabled ?? true); // Default to true if undefined
    return this.eventRepository.update(eventId, { commentsEnabled: newStatus } as UpdateEventDto);
  }

  /**
   * Plant ein Release für ein Event - setzt das geplante Release-Datum
   * und ändert den Status auf 'draft', falls noch nicht gesetzt
   * @param eventId - Die ID des Events
   * @param releaseDate - Das geplante Release-Datum
   * @param hostId - Die ID des Event-Hosts (für Berechtigungsprüfung)
   * @returns Das aktualisierte Event
   */
  async planRelease(eventId: string, releaseDate: Date, hostId: string): Promise<Event | null> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.hostId !== hostId) {
      throw new ForbiddenException('Only the event host can plan a release');
    }

    // Prüfe, ob das Release-Datum in der Zukunft liegt
    if (releaseDate <= new Date()) {
      throw new BadRequestException('Release date must be in the future');
    }

    // Setze Status auf 'draft', falls noch nicht gesetzt
    const updateData: UpdateEventDto = {
      scheduledReleaseDate: releaseDate,
      status: event.status || 'draft',
    };

    return this.eventRepository.update(eventId, updateData);
  }

  /**
   * Veröffentlicht alle Events, deren scheduledReleaseDate erreicht wurde
   * Wird von einem Cron-Job aufgerufen
   * @returns Anzahl der veröffentlichten Events
   */
  async processScheduledReleases(): Promise<number> {
    const now = new Date();
    const events = await this.eventRepository.findEventsWithScheduledRelease(now);
    
    let publishedCount = 0;
    for (const event of events) {
      if (event.scheduledReleaseDate && event.scheduledReleaseDate <= now) {
        await this.eventRepository.update(event.id, {
          status: 'published',
          scheduledReleaseDate: undefined, // Entferne das geplante Datum nach Veröffentlichung
        } as UpdateEventDto);
        publishedCount++;
      }
    }

    return publishedCount;
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
      const eventData: any = {
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
      const eventData: any = {
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
      const eventData: any = {
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
      const eventData: any = {
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
        } as any,
      };

      const createdEvent = await this.eventRepository.create(eventData);
      await this.profileService.addCreatedEvent(userId, createdEvent.id);
      await this.userService.addUserPoints(userId, 20);

            // event description - generate asynchronously without blocking
            this.chatGptService.generateDetailedEventDescription(createdEvent)
            .then((eventDescription) => {
              console.log('eventDescription', eventDescription);
              return this.eventRepository.update(createdEvent.id, { description: eventDescription });
            })
            .catch((error) => {
              console.error('Failed to generate event description:', error);
              // Optionally update with a fallback description or leave existing
            });

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
    citySlug?: string;
    category?: string;
    categorySlug?: string;
    eventType?: string;
    genre?: string;
    dateRange?: { startDate: string; endDate: string };
    status?: string;
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
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl,
      communityId: event.communityId,
      commentCount: event.commentCount,
      locationId: event.locationId,
      category: event.category,
      price: event.price,
      ticketLink: event.ticketLink,
      lineup: event.lineup,
      socialMediaLinks: event.socialMediaLinks,
      tags: event.tags,
      website: event.website,
      views: event.views,
      startDate: event.startDate,
      startTime: event.startTime,
      hostId: event.hostId,
      regenstrations: event.regenstrations,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
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

  // ------------------------------------------------------------
  // Get VECTOR PROFILE RESULTS
  // ------------------------------------------------------------
  async getVectorProfileResults(
    userId: string,
    offset: number = 0,
    limit: number = 20,
  ): Promise<Array<{ event: Event; similarityScore: number }>> {
    const profile = await this.profileService.getProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    
    
    if (!profile.embedding || !Array.isArray(profile.embedding) || profile.embedding.length === 0) {
      throw new BadRequestException(
        'Das Profil besitzt noch kein Embedding und kann keine Events empfohlen werden.',
      );
    }

    // Filter für kommende Events (nur zukünftige Events)
    const now = new Date();
    const nowTimestamp = Math.floor(now.getTime() / 1000);
    
    const dateFilter = {
      must: [
        {
          key: 'start_time',
          range: {
            gte: nowTimestamp,
          },
        },
      ],
    };

    // Hole mehr Events von Qdrant für Pagination (offset + limit + etwas Puffer)
    const qdrantLimit = offset + limit + 10; // Puffer für mögliche fehlende Events

    // Suche ähnliche Events basierend auf Profil-Vector
    let searchResults;
    try {
      searchResults = await this.qdrantService.searchEventsSimilar({
        vector: profile.embedding,
        limit: 20,
        filter: dateFilter,
        withPayload: true,
      });
    } catch (error) {
      // Logge den Qdrant-Fehler inkl. Details
      const errorDetails =
        error?.response?.data?.status?.error ||
        error?.message ||
        JSON.stringify(error);

      // Prüfe auf spezifischen Formatierungsfehler im JSON Body und gib klarere Fehlermeldung aus
      if (
        errorDetails &&
        errorDetails.toString().includes('Format error in JSON body')
      ) {
        throw new BadRequestException(
          'Fehler bei der Suche nach Events: Die Datenbank hat einen Formatfehler entdeckt. Wahrscheinlich ist eines der Event-Felder als Zahl erwartet, enthält aber einen Wert vom Typ String (z.B. eine Postleitzahl als "02010" statt als Zahl). Bitte melde dieses Problem dem Support.',
        );
      }
      throw new BadRequestException(
        `Fehler bei der Suche nach ähnlichen Events (Qdrant): ${errorDetails}`,
      );
    }

    if (searchResults.length === 0) {
      return [];
    }

    // Erstelle Map für Event-IDs mit ihren Scores
    const eventIdScoreMap = new Map<string, number>();
    const eventIds: string[] = [];

    searchResults.forEach((hit) => {
      const eventId = this.extractEventIdFromPayload(hit.payload);
      if (eventId && !eventIdScoreMap.has(eventId)) {
        eventIdScoreMap.set(eventId, hit.score || 0);
        eventIds.push(eventId);
      }
    });

    if (eventIds.length === 0) {
      return [];
    }

    // Hole Events aus der Datenbank
    const events = await Promise.all(
      eventIds.map((id) => this.eventRepository.findById(id)),
    );

    // Kombiniere Events mit Scores und filtere null-Werte
    const eventsWithScores = events
      .map((event, index) => {
        if (!event) return null;
        return {
          event: this.toEntity(event),
          similarityScore: eventIdScoreMap.get(eventIds[index]) || 0,
        };
      })
      .filter(
        (item): item is { event: Event; similarityScore: number } =>
          item !== null,
      );

    // Paginiere die Ergebnisse
    const paginatedResults = eventsWithScores.slice(offset, offset + limit);

    return paginatedResults;
  }


}
