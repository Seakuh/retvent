import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../../core/domain/user';
import { IUserRepository } from '../../../core/repositories/user.repository.interface';
import { UserDocument } from '../../schemas/user.schema';

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

  async addLikedEvent(userId: string, eventId: string): Promise<User | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { likedEventIds: eventId } },
        { new: true }
      )
      .exec();
    return updated ? new User(updated.toObject()) : null;
  }

  async removeLikedEvent(userId: string, eventId: string): Promise<User | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { likedEventIds: eventId } },
        { new: true }
      )
      .exec();
    return updated ? new User(updated.toObject()) : null;
  }

  async addFollowedLocation(userId: string, locationId: string): Promise<User | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { followedLocationIds: locationId } },
        { new: true }
      )
      .exec();
    return updated ? new User(updated.toObject()) : null;
  }

  async removeFollowedLocation(userId: string, locationId: string): Promise<User | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { followedLocationIds: locationId } },
        { new: true }
      )
      .exec();
    return updated ? new User(updated.toObject()) : null;
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      $or: [{ email }, { username }]
    }).exec();
    
    return user ? new User(user.toObject()) : null;
  }

  // Ähnliche Implementierungen für Location-Following...
} 