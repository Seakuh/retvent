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
}
