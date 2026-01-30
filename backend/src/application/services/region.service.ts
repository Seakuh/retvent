import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { IRegionRepository } from '../../core/repositories/region.repository.interface';
import { Region } from '../../core/domain/region';
import { CreateRegionDto } from '../../presentation/dtos/create-region.dto';
import { UpdateRegionDto } from '../../presentation/dtos/update-region.dto';
import { VibeRatingDto } from '../../presentation/dtos/vibe-rating.dto';
import { ImageService } from '../../infrastructure/services/image.service';
import { GeolocationService } from '../../infrastructure/services/geolocation.service';
import { SlugService } from '../../infrastructure/services/slug.service';
import { ChatGPTService } from '../../infrastructure/services/chatgpt.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegionVibeRatingDocument } from '../../infrastructure/schemas/region-vibe-rating.schema';
import { IEventRepository } from '../../core/repositories/event.repository.interface';
import { Event } from '../../core/domain/event';
import { ICommentRepository } from '../../core/repositories/comment.repository.interface';

@Injectable()
export class RegionService {
  constructor(
    @Inject('IRegionRepository')
    private readonly regionRepository: IRegionRepository,
    private readonly imageService: ImageService,
    private readonly geolocationService: GeolocationService,
    private readonly slugService: SlugService,
    private readonly chatGptService: ChatGPTService,
    @InjectModel('RegionVibeRating')
    private readonly vibeRatingModel: Model<RegionVibeRatingDocument>,
    @Inject(forwardRef(() => 'IEventRepository'))
    private readonly eventRepository: IEventRepository,
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
  ) {}

  async createRegion(
    data: CreateRegionDto,
    logo?: Express.Multer.File,
    images?: Express.Multer.File[],
  ): Promise<Region> {
    // Slug generieren falls nicht vorhanden
    let slug = data.slug;
    if (!slug) {
      slug = this.slugService.stringToSlug(data.name);
      // Stelle sicher, dass Slug eindeutig ist
      const existingRegion = await this.regionRepository.findBySlug(slug);
      if (existingRegion) {
        let counter = 1;
        let uniqueSlug = `${slug}-${counter}`;
        while (await this.regionRepository.findBySlug(uniqueSlug)) {
          counter++;
          uniqueSlug = `${slug}-${counter}`;
        }
        slug = uniqueSlug;
      }
    }

    // Logo hochladen
    let logoUrl: string | undefined;
    if (logo) {
      logoUrl = await this.imageService.uploadImage(logo);
    }

    // Bilder hochladen
    const imageUrls: string[] = [];
    if (images && images.length > 0) {
      for (const image of images) {
        const url = await this.imageService.uploadImage(image);
        imageUrls.push(url);
      }
    }

    // Koordinaten aus Adresse holen falls nicht vorhanden
    let coordinates = data.coordinates;
    if (!coordinates && data.address) {
      const coords = await this.geolocationService.getCoordinates(data.address);
      if (coords) {
        coordinates = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
      }
    }

    const regionData: Partial<Region> = {
      ...data,
      slug,
      logoUrl,
      images: imageUrls,
      coordinates,
      eventIds: [],
      serviceIds: data.serviceIds || [],
      commentIds: [],
      likeIds: [],
      shareCount: 0,
      followerIds: [],
    };

    return this.regionRepository.create(regionData);
  }

  async getRegionById(id: string): Promise<Region> {
    const region = await this.regionRepository.findById(id);
    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }
    return region;
  }

  async getRegionBySlug(slug: string): Promise<Region> {
    const region = await this.regionRepository.findBySlug(slug);
    if (!region) {
      throw new NotFoundException(`Region with slug ${slug} not found`);
    }
    return region;
  }

  async updateRegion(
    id: string,
    data: UpdateRegionDto,
    logo?: Express.Multer.File,
    images?: Express.Multer.File[],
  ): Promise<Region> {
    const region = await this.getRegionById(id);

    // Logo aktualisieren falls vorhanden
    if (logo) {
      data.logoUrl = await this.imageService.uploadImage(logo);
    }

    // Bilder hinzufügen falls vorhanden
    if (images && images.length > 0) {
      const existingImages = region.images || [];
      const newImageUrls: string[] = [];
      for (const image of images) {
        const url = await this.imageService.uploadImage(image);
        newImageUrls.push(url);
      }
      data.images = [...existingImages, ...newImageUrls];
    }

    // Koordinaten aus Adresse holen falls Adresse geändert wurde
    if (data.address && !data.coordinates) {
      const coords = await this.geolocationService.getCoordinates(data.address);
      if (coords) {
        data.coordinates = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
      }
    }

    // Slug validieren falls geändert
    if (data.slug && data.slug !== region.slug) {
      const existingRegion = await this.regionRepository.findBySlug(data.slug);
      if (existingRegion && existingRegion.id !== id) {
        throw new BadRequestException(`Slug ${data.slug} is already taken`);
      }
    }

    return this.regionRepository.update(id, data);
  }

  async deleteRegion(id: string): Promise<void> {
    const region = await this.getRegionById(id);
    const deleted = await this.regionRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }
  }

  async searchRegions(query: string): Promise<Region[]> {
    return this.regionRepository.searchRegions(query);
  }

  async findRegionsNearby(
    lat: number,
    lon: number,
    radiusKm: number = 50,
  ): Promise<Region[]> {
    return this.regionRepository.findByCoordinates(lat, lon, radiusKm);
  }

  async getEventsInRegion(regionId: string): Promise<Event[]> {
    await this.getRegionById(regionId); // Prüfe ob Region existiert
    return this.regionRepository.findEventsInRegion(regionId);
  }

  async addEventToRegion(regionId: string, eventId: string): Promise<Region> {
    await this.getRegionById(regionId);
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const region = await this.regionRepository.addEvent(regionId, eventId);
    if (!region) {
      throw new NotFoundException(`Region with ID ${regionId} not found`);
    }

    return region;
  }

  async removeEventFromRegion(
    regionId: string,
    eventId: string,
  ): Promise<Region> {
    await this.getRegionById(regionId);
    const region = await this.regionRepository.removeEvent(regionId, eventId);
    if (!region) {
      throw new NotFoundException(`Region with ID ${regionId} not found`);
    }
    return region;
  }

  async likeRegion(regionId: string, userId: string): Promise<Region> {
    await this.getRegionById(regionId);
    const region = await this.regionRepository.addLike(regionId, userId);
    if (!region) {
      throw new NotFoundException(`Region with ID ${regionId} not found`);
    }
    return region;
  }

  async unlikeRegion(regionId: string, userId: string): Promise<Region> {
    await this.getRegionById(regionId);
    const region = await this.regionRepository.removeLike(regionId, userId);
    if (!region) {
      throw new NotFoundException(`Region with ID ${regionId} not found`);
    }
    return region;
  }

  async followRegion(regionId: string, userId: string): Promise<Region> {
    await this.getRegionById(regionId);
    const region = await this.regionRepository.addFollower(regionId, userId);
    if (!region) {
      throw new NotFoundException(`Region with ID ${regionId} not found`);
    }
    return region;
  }

  async unfollowRegion(regionId: string, userId: string): Promise<Region> {
    await this.getRegionById(regionId);
    const region = await this.regionRepository.removeFollower(regionId, userId);
    if (!region) {
      throw new NotFoundException(`Region with ID ${regionId} not found`);
    }
    return region;
  }

  async shareRegion(regionId: string): Promise<Region> {
    await this.getRegionById(regionId);
    const region = await this.regionRepository.incrementShareCount(regionId);
    if (!region) {
      throw new NotFoundException(`Region with ID ${regionId} not found`);
    }
    return region;
  }

  async rateVibe(
    regionId: string,
    userId: string,
    vibe: VibeRatingDto,
  ): Promise<void> {
    await this.getRegionById(regionId);

    // Prüfe ob bereits eine Bewertung existiert
    const existingRating = await this.vibeRatingModel.findOne({
      regionId,
      userId,
    });

    const ratingData = {
      regionId,
      userId,
      vibe: {
        energy: vibe.energy,
        intimacy: vibe.intimacy,
        exclusivity: vibe.exclusivity,
        social: vibe.social,
      },
    };

    if (existingRating) {
      // Update bestehende Bewertung
      await this.vibeRatingModel.findByIdAndUpdate(
        existingRating._id,
        ratingData,
      );
    } else {
      // Erstelle neue Bewertung
      await this.vibeRatingModel.create(ratingData);
    }
  }

  async getVibeAverage(regionId: string): Promise<{
    energy: number;
    intimacy: number;
    exclusivity: number;
    social: number;
  }> {
    await this.getRegionById(regionId);

    const result = await this.vibeRatingModel.aggregate([
      { $match: { regionId: regionId } },
      {
        $group: {
          _id: null,
          avgEnergy: { $avg: '$vibe.energy' },
          avgIntimacy: { $avg: '$vibe.intimacy' },
          avgExclusivity: { $avg: '$vibe.exclusivity' },
          avgSocial: { $avg: '$vibe.social' },
        },
      },
    ]);

    if (result.length === 0) {
      // Keine Bewertungen vorhanden
      return {
        energy: 50,
        intimacy: 50,
        exclusivity: 50,
        social: 50,
      };
    }

    return {
      energy: Math.round(result[0].avgEnergy),
      intimacy: Math.round(result[0].avgIntimacy),
      exclusivity: Math.round(result[0].avgExclusivity),
      social: Math.round(result[0].avgSocial),
    };
  }

  async getAllRegions(): Promise<Region[]> {
    return this.regionRepository.findAll();
  }

  /**
   * Findet automatisch die passende Region für ein Event basierend auf:
   * 1. Geografischen Koordinaten (Radius-Suche)
   * 2. Stadt-Name
   * 3. Adresse
   * 
   * @param event - Event mit Koordinaten, Stadt oder Adresse
   * @returns Region oder null wenn keine passende gefunden wurde
   */
  async findRegionForEvent(event: {
    location?: {
      coordinates?: { lat?: number; lon?: number };
      city?: string;
      address?: string;
    };
    city?: string;
    address?: {
      city?: string;
      street?: string;
    };
    coordinates?: { lat?: number; lon?: number };
    uploadLat?: number;
    uploadLon?: number;
  }): Promise<Region | null> {
    // Extrahiere Koordinaten aus verschiedenen möglichen Feldern
    let lat: number | undefined;
    let lon: number | undefined;

    if (event.location?.coordinates) {
      lat = event.location.coordinates.lat;
      lon = event.location.coordinates.lon;
    } else if (event.coordinates) {
      lat = event.coordinates.lat;
      lon = event.coordinates.lon;
    } else if (event.uploadLat && event.uploadLon) {
      lat = event.uploadLat;
      lon = event.uploadLon;
    }

    // Strategie 1: Koordinaten-basierte Suche (Radius 50km)
    if (lat && lon) {
      const nearbyRegions = await this.regionRepository.findByCoordinates(
        lat,
        lon,
        50, // 50km Radius
      );
      if (nearbyRegions.length > 0) {
        // Nimm die nächstgelegene Region
        return nearbyRegions[0];
      }
    }

    // Strategie 2: Stadt-basierte Suche
    const cityName =
      event.location?.city ||
      event.city ||
      event.address?.city;
    
    if (cityName) {
      // Suche nach Regionen mit passendem Namen oder Stadt
      const allRegions = await this.regionRepository.findAll();
      const matchingRegion = allRegions.find(
        (region) =>
          region.name.toLowerCase() === cityName.toLowerCase() ||
          region.name.toLowerCase().includes(cityName.toLowerCase()) ||
          cityName.toLowerCase().includes(region.name.toLowerCase()),
      );
      if (matchingRegion) {
        return matchingRegion;
      }
    }

    // Strategie 3: Adress-basierte Suche (falls Adresse vorhanden)
    if (event.location?.address || event.address) {
      const address = event.location?.address || event.address?.street;
      if (address) {
        const allRegions = await this.regionRepository.findAll();
        const matchingRegion = allRegions.find(
          (region) =>
            region.address &&
            (region.address.toLowerCase().includes(address.toLowerCase()) ||
              address.toLowerCase().includes(region.address.toLowerCase())),
        );
        if (matchingRegion) {
          return matchingRegion;
        }
      }
    }

    return null;
  }

  /**
   * Verknüpft ein Event automatisch mit einer Region
   * Erstellt automatisch eine neue Region, wenn keine gefunden wird
   * @param eventId - ID des Events
   * @param event - Event-Daten für Region-Suche
   * @returns Die zugeordnete Region oder null
   */
  async autoAssignEventToRegion(
    eventId: string,
    event: {
      location?: {
        coordinates?: { lat?: number; lon?: number };
        city?: string;
        address?: string;
      };
      city?: string;
      address?: {
        city?: string;
        street?: string;
      };
      coordinates?: { lat?: number; lon?: number };
      uploadLat?: number;
      uploadLon?: number;
      category?: string;
      eventType?: string;
      genre?: string[];
      country?: string;
    },
  ): Promise<Region | null> {
    const region = await this.findRegionForEvent(event);
    if (region) {
      // Füge Event zur Region hinzu
      await this.regionRepository.addEvent(region.id, eventId);
      return region;
    }

    // Keine Region gefunden - erstelle automatisch eine neue
    console.log('Keine Region gefunden, erstelle neue Region für Event:', eventId);
    
    try {
      // Bestimme Region-Name (Stadt oder Adresse)
      const regionName = 
        event.location?.city || 
        event.city || 
        event.address?.city || 
        'Unbekannte Region';

      // Extrahiere Koordinaten
      let coordinates: { latitude: number; longitude: number } | undefined;
      if (event.location?.coordinates?.lat && event.location?.coordinates?.lon) {
        coordinates = {
          latitude: event.location.coordinates.lat,
          longitude: event.location.coordinates.lon,
        };
      } else if (event.coordinates?.lat && event.coordinates?.lon) {
        coordinates = {
          latitude: event.coordinates.lat,
          longitude: event.coordinates.lon,
        };
      } else if (event.uploadLat && event.uploadLon) {
        coordinates = {
          latitude: event.uploadLat,
          longitude: event.uploadLon,
        };
      } else if (event.address?.street || event.location?.address) {
        // Versuche Koordinaten aus Adresse zu holen
        const address = event.address?.street || event.location?.address || '';
        const coords = await this.geolocationService.getCoordinates(address);
        if (coords) {
          coordinates = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
        }
      }

      // Generiere Beschreibung und Vibe mit ChatGPT
      const regionInfo = await this.chatGptService.generateRegionDescriptionAndVibe({
        name: regionName,
        city: event.location?.city || event.city || event.address?.city,
        country: event.country,
        address: event.address?.street || event.location?.address,
        eventContext: {
          category: event.category,
          eventType: event.eventType,
          genre: event.genre,
        },
      });

      // Erstelle neue Region
      const createRegionDto: CreateRegionDto = {
        name: regionName,
        description: regionInfo.description,
        address: event.address?.street || event.location?.address,
        country: event.country,
        coordinates: coordinates ? {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        } : undefined,
        vibe: regionInfo.vibe,
      };

      const newRegion = await this.createRegion(createRegionDto);

      // Füge Event zur neuen Region hinzu
      await this.regionRepository.addEvent(newRegion.id, eventId);

      console.log(`Neue Region "${regionName}" erstellt und Event ${eventId} zugeordnet`);
      return newRegion;
    } catch (error) {
      console.error('Fehler beim automatischen Erstellen einer Region:', error);
      return null;
    }
  }

  /**
   * Verknüpft alle Events ohne Region automatisch mit passenden Regionen
   * @param batchSize - Anzahl der Events pro Batch
   * @returns Anzahl der verknüpften Events
   */
  async autoAssignEventsToRegions(batchSize: number = 100): Promise<number> {
    // Hole alle Events ohne regionId
    // Verwende eine spezielle Query-Methode falls vorhanden, sonst findAll und filtern
    let allEvents: Event[];
    try {
      // Versuche eine Methode zu finden, die Events ohne regionId zurückgibt
      allEvents = await this.eventRepository.findAll();
    } catch (error) {
      console.error('Fehler beim Laden der Events:', error);
      return 0;
    }
    
    const eventsToProcess = allEvents
      .filter((event) => !event.regionId)
      .slice(0, batchSize);

    let assignedCount = 0;

    for (const event of eventsToProcess.slice(0, batchSize)) {
      try {
        const eventData: any = {
          location: event.location,
          city: event.city,
          address: event.address,
          uploadLat: (event as any).uploadLat,
          uploadLon: (event as any).uploadLon,
        };
        
        // Extrahiere coordinates aus verschiedenen möglichen Stellen
        if (event.location?.coordinates) {
          eventData.coordinates = event.location.coordinates;
        } else if ((event as any).coordinates) {
          eventData.coordinates = (event as any).coordinates;
        }
        
        const region = await this.findRegionForEvent(eventData);

        if (region) {
          // Update Event mit regionId
          await this.eventRepository.update(event.id, {
            regionId: region.id,
          } as any);

          // Füge Event zur Region hinzu
          await this.regionRepository.addEvent(region.id, event.id);
          assignedCount++;
        }
      } catch (error) {
        console.error(
          `Fehler beim Zuordnen von Event ${event.id} zu Region:`,
          error,
        );
      }
    }

    return assignedCount;
  }

  async uploadImages(
    regionId: string,
    images: Express.Multer.File[],
  ): Promise<Region> {
    const region = await this.getRegionById(regionId);

    // Lade alle Images hoch
    const imageUrls: string[] = [];
    for (const image of images) {
      const url = await this.imageService.uploadImage(image);
      imageUrls.push(url);
    }

    // Füge die neuen Images zu den bestehenden hinzu
    const existingImages = region.images || [];
    const updatedImages = [...existingImages, ...imageUrls];

    return this.regionRepository.update(regionId, {
      images: updatedImages,
    });
  }

  async uploadLogo(
    regionId: string,
    logo: Express.Multer.File,
  ): Promise<Region> {
    await this.getRegionById(regionId);

    // Lade Logo hoch
    const logoUrl = await this.imageService.uploadImage(logo);

    return this.regionRepository.update(regionId, {
      logoUrl,
    });
  }
}
