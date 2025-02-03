import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location } from '../../../core/domain/location';
import { ILocationRepository } from '../../../core/repositories/location.repository.interface';
import { LocationDocument } from '../../schemas/location.schema';

@Injectable()
export class MongoLocationRepository implements ILocationRepository {
  constructor(
    @InjectModel('Location') private locationModel: Model<LocationDocument>
  ) {}

  async findById(id: string): Promise<Location | null> {
    const location = await this.locationModel.findById(id).exec();
    return location ? new Location(location.toObject()) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Location[]> {
    const locations = await this.locationModel.find({ ownerId }).exec();
    return locations.map(loc => new Location(loc.toObject()));
  }

  async create(locationData: Partial<Location>): Promise<Location> {
    const created = await this.locationModel.create(locationData);
    return new Location(created.toObject());
  }

  async update(id: string, locationData: Partial<Location>): Promise<Location | null> {
    const updated = await this.locationModel
      .findByIdAndUpdate(id, locationData, { new: true })
      .exec();
    return updated ? new Location(updated.toObject()) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.locationModel.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }

  async findNearby(lat: number, lon: number, maxDistance: number): Promise<Location[]> {
    const locations = await this.locationModel.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lon, lat]
          },
          $maxDistance: maxDistance * 1000 // Convert km to meters
        }
      }
    }).exec();
    return locations.map(loc => new Location(loc.toObject()));
  }

  async addFollower(locationId: string, userId: string): Promise<Location | null> {
    const updated = await this.locationModel
      .findByIdAndUpdate(
        locationId,
        { $addToSet: { followerIds: userId } },
        { new: true }
      )
      .exec();
    return updated ? new Location(updated.toObject()) : null;
  }

  async removeFollower(locationId: string, userId: string): Promise<Location | null> {
    const updated = await this.locationModel
      .findByIdAndUpdate(
        locationId,
        { $pull: { followerIds: userId } },
        { new: true }
      )
      .exec();
    return updated ? new Location(updated.toObject()) : null;
  }

  async addLike(locationId: string, userId: string): Promise<Location | null> {
    const updated = await this.locationModel
      .findByIdAndUpdate(
        locationId,
        { $addToSet: { likeIds: userId } },
        { new: true }
      )
      .exec();
    return updated ? new Location(updated.toObject()) : null;
  }

  async removeLike(locationId: string, userId: string): Promise<Location | null> {
    const updated = await this.locationModel
      .findByIdAndUpdate(
        locationId,
        { $pull: { likeIds: userId } },
        { new: true }
      )
      .exec();
    return updated ? new Location(updated.toObject()) : null;
  }
} 