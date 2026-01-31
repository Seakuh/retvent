import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Region } from '../../../core/domain/region';
import { IRegionRepository } from '../../../core/repositories/region.repository.interface';
import { UpdateRegionDto } from 'src/presentation/dtos/update-region.dto';
import { RegionDocument } from '../../schemas/region.schema';
import { Event } from '../../../core/domain/event';
import { Inject } from '@nestjs/common';
import { IEventRepository } from '../../../core/repositories/event.repository.interface';
import { MongoEventRepository } from './event.repository';

@Injectable()
export class MongoRegionRepository implements IRegionRepository {
  constructor(
    @InjectModel('Region') private regionModel: Model<RegionDocument>,
    @Inject('IEventRepository')
    private eventRepository: IEventRepository,
  ) {}

  private toEntity(doc: any): Region {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new Region({
      id: obj._id?.toString() || obj.id,
      name: obj.name,
      description: obj.description,
      slug: obj.slug,
      logoUrl: obj.logoUrl,
      images: obj.images || [],
      vibe: obj.vibe,
      coordinates: obj.coordinates,
      address: obj.address,
      country: obj.country,
      parentRegion: obj.parentRegion,
      eventIds: obj.eventIds || [],
      serviceIds: obj.serviceIds || [],
      commentIds: obj.commentIds || [],
      likeIds: obj.likeIds || [],
      shareCount: obj.shareCount || 0,
      followerIds: obj.followerIds || [],
      metaDescription: obj.metaDescription,
      h1: obj.h1,
      introText: obj.introText,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    });
  }

  async create(region: Partial<Region>): Promise<Region> {
    const created = await this.regionModel.create(region);
    return this.toEntity(created);
  }

  async findById(id: string): Promise<Region | null> {
    const region = await this.regionModel.findById(id).exec();
    return region ? this.toEntity(region) : null;
  }

  async findBySlug(slug: string): Promise<Region | null> {
    const region = await this.regionModel.findOne({ slug: { $regex: new RegExp(`^${slug}$`, 'i') } }).exec();
    return region ? this.toEntity(region) : null;
  }

  async findAll(): Promise<Region[]> {
    const regions = await this.regionModel.find().exec();
    return regions.map((r) => this.toEntity(r));
  }

  async update(id: string, data: UpdateRegionDto): Promise<Region | null> {
    const updated = await this.regionModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.regionModel.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }

  async findByCoordinates(
    lat: number,
    lon: number,
    radiusKm: number,
  ): Promise<Region[]> {
    // Haversine-Formel für Radius-Suche
    // MongoDB unterstützt keine direkte Haversine-Suche ohne GeoJSON,
    // daher verwenden wir eine Aggregation mit manueller Distanzberechnung
    const regions = await this.regionModel.aggregate([
      {
        $match: {
          'coordinates.latitude': { $exists: true },
          'coordinates.longitude': { $exists: true },
        },
      },
      {
        $addFields: {
          distance: {
            $multiply: [
              6371, // Erdradius in km
              {
                $acos: {
                  $add: [
                    {
                      $multiply: [
                        {
                          $sin: {
                            $degreesToRadians: '$coordinates.latitude',
                          },
                        },
                        {
                          $sin: {
                            $degreesToRadians: lat,
                          },
                        },
                      ],
                    },
                    {
                      $multiply: [
                        {
                          $cos: {
                            $degreesToRadians: '$coordinates.latitude',
                          },
                        },
                        {
                          $cos: {
                            $degreesToRadians: lat,
                          },
                        },
                        {
                          $cos: {
                            $degreesToRadians: {
                              $subtract: [
                                '$coordinates.longitude',
                                lon,
                              ],
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      {
        $match: {
          distance: { $lte: radiusKm },
        },
      },
      {
        $sort: { distance: 1 },
      },
    ]);

    return regions.map((r) => this.toEntity(r));
  }

  async findEventsInRegion(regionId: string): Promise<Event[]> {
    const region = await this.findById(regionId);
    if (!region || !region.eventIds || region.eventIds.length === 0) {
      return [];
    }

    const events: Event[] = [];
    for (const eventId of region.eventIds) {
      const event = await this.eventRepository.findById(eventId);
      if (event) {
        events.push(event);
      }
    }
    return events;
  }

  async addEvent(regionId: string, eventId: string): Promise<Region | null> {
    const updated = await this.regionModel
      .findByIdAndUpdate(
        regionId,
        { $addToSet: { eventIds: eventId } },
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async removeEvent(
    regionId: string,
    eventId: string,
  ): Promise<Region | null> {
    const updated = await this.regionModel
      .findByIdAndUpdate(
        regionId,
        { $pull: { eventIds: eventId } },
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async addLike(regionId: string, userId: string): Promise<Region | null> {
    const updated = await this.regionModel
      .findByIdAndUpdate(
        regionId,
        { $addToSet: { likeIds: userId } },
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async removeLike(regionId: string, userId: string): Promise<Region | null> {
    const updated = await this.regionModel
      .findByIdAndUpdate(
        regionId,
        { $pull: { likeIds: userId } },
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async addFollower(
    regionId: string,
    userId: string,
  ): Promise<Region | null> {
    const updated = await this.regionModel
      .findByIdAndUpdate(
        regionId,
        { $addToSet: { followerIds: userId } },
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async removeFollower(
    regionId: string,
    userId: string,
  ): Promise<Region | null> {
    const updated = await this.regionModel
      .findByIdAndUpdate(
        regionId,
        { $pull: { followerIds: userId } },
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async incrementShareCount(regionId: string): Promise<Region | null> {
    const updated = await this.regionModel
      .findByIdAndUpdate(
        regionId,
        { $inc: { shareCount: 1 } },
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async searchRegions(query: string): Promise<Region[]> {
    const regions = await this.regionModel
      .find({
        $text: { $search: query },
      })
      .exec();
    return regions.map((r) => this.toEntity(r));
  }
}
