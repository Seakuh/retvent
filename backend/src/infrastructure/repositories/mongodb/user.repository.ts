import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../../core/domain/user';
import { IUserRepository } from '../../../core/repositories/user.repository.interface';
import { UserDocument } from '../../schemas/user.schema';
import { Location } from '../../../core/domain/location';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>
  ) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? new User(user.toObject()) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? new User(user.toObject()) : null;
  }

  async create(userData: Partial<User>): Promise<User> {
    const created = await this.userModel.create(userData);
    return new User(created.toObject());
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, userData, { new: true })
      .exec();
    return updated ? new User(updated.toObject()) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }

  async addLikedEvent(userId: string, eventId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { likedEventIds: eventId } }
    );
  }

  async removeLikedEvent(userId: string, eventId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { likedEventIds: eventId } }
    );
  }

  async addFollowedLocation(userId: string, locationId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { followedLocations: locationId } }
    );
  }

  async removeFollowedLocation(userId: string, locationId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { followedLocations: locationId } }
    );
  }

  async addFollowedArtist(userId: string, artistId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { followedArtists: artistId } }
    );
  }

  async removeFollowedArtist(userId: string, artistId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { followedArtists: artistId } }
    );
  }

  async getFollowedLocationsWithDetails(userId: string): Promise<Location[]> {
    const user = await this.userModel
      .findById(userId)
      .populate<{ followedLocationIds: Location[] }>('followedLocationIds')
      .exec();
    return user?.followedLocationIds || [];
  }

  async getFollowedArtistsWithDetails(userId: string): Promise<User[]> {
    const user = await this.userModel
      .findById(userId)
      .populate<{ followedArtistIds: User[] }>('followedArtistIds')
      .exec();
    return user?.followedArtistIds || [];
  }

  async isFollowingLocation(userId: string, locationId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    return user?.followedLocationIds?.includes(locationId) || false;
  }

  async isFollowingArtist(userId: string, artistId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    return user?.followedArtistIds?.includes(artistId) || false;
  }

  async addCreatedEvent(userId: string, eventId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { createdEventIds: eventId } }
    );
  }
} 