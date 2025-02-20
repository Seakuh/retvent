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

  private toEntity(doc: UserDocument): User {
    const { _id, ...rest } = doc.toObject();
    return new User({
      id: _id.toString(),
      ...rest
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email });
    return user ? this.toEntity(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id);
    return user ? this.toEntity(user) : null;
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      $or: [{ email }, { username }]
    });
    return user ? this.toEntity(user) : null;
  }

  async create(userData: Partial<User>): Promise<User> {
    const created = await this.userModel.create(userData);
    return this.toEntity(created);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, userData, { new: true })
      .exec();
    return updated ? this.toEntity(updated) : null;
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
    return updated ? this.toEntity(updated) : null;
  }

  async removeLikedEvent(userId: string, eventId: string): Promise<User | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { likedEventIds: eventId } },
        { new: true }
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async addFollowedLocation(userId: string, locationId: string): Promise<User | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { followedLocationIds: locationId } },
        { new: true }
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async removeFollowedLocation(userId: string, locationId: string): Promise<User | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { followedLocationIds: locationId } },
        { new: true }
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  // Ähnliche Implementierungen für Location-Following...
} 