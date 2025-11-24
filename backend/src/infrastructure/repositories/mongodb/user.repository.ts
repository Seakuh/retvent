import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../../core/domain/user';
import { IUserRepository } from '../../../core/repositories/user.repository.interface';
import { UserDocument } from '../../schemas/user.schema';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  private toEntity(doc: UserDocument): User {
    const { _id, ...rest } = doc.toObject();
    return new User({
      id: _id.toString(),
      ...rest,
    });
  }
  addUserPoints(userId: string, amount: number) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $inc: { points: amount } },
      { new: true },
    );
  }

  getUserPoints(userId: string) {
    return this.userModel.findById(userId).then(async (user) => {
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.points === undefined) {
        user.points = 0;
        await user.save();
      }
      return user.points;
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email });
    return user ? this.toEntity(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id);
    if (!user) {
      return null;
    }
    if (user.points === undefined) {
      user.points = 0;
      await user.save();
    }
    return this.toEntity(user);
  }

  async findByUserId(userId: string): Promise<User | null> {
    return await this.userModel.findById(userId);
  }

  async findByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<User | null> {
    const user = await this.userModel.findOne({
      $or: [{ email }, { username }],
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
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  findByUsername(username: string) {
    return this.userModel.findOne({ username }).exec();
  }

  async removeLikedEvent(
    userId: string,
    eventId: string,
  ): Promise<User | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { likedEventIds: eventId } },
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async addFollowedLocation(
    userId: string,
    locationId: string,
  ): Promise<User | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { followedLocationIds: locationId } },
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async removeFollowedLocation(
    userId: string,
    locationId: string,
  ): Promise<User | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { followedLocationIds: locationId } },
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async getUserProfileData(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id);
    return user ? this.toEntity(user) : null;
  }

  async getProfileInfo(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id);
    return user ? this.toEntity(user) : null;
  }

  // Ähnliche Implementierungen für Location-Following...

  updateFavorites(userId: any, favoriteEventIds: string[]) {
    return this.userModel.findByIdAndUpdate(userId, {
      $set: { favoriteEventIds },
    });
  }

  async getUserFavorites(id: string) {
    const user = await this.userModel.findById(id).lean();
    return user?.favoriteEventIds ?? [];
  }

  async removeFavorite(userId: any, id: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(userId, {
      $pull: { favoriteEventIds: id },
    });
  }

  async addFavorite(userId: any, id: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { favoriteEventIds: id },
    });
  }

  addFollowedProfile(userId: any, id: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { followedProfiles: id },
    });
  }

  removeFollowedProfile(userId: any, id: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      $pull: { followedProfiles: id },
    });
  }

  getFollowedProfiles(userId: string) {
    return this.userModel.findById(userId).then((user) => {
      return user?.followedProfiles ?? [];
    });
  }

  getUserEventPage(userId: string) {
    return this.userModel.findById(userId).then((user) => {
      return {
        favoriteEventIds: user?.favoriteEventIds ?? [],
        followedProfiles: user?.followedProfiles ?? [],
      };
    });
  }

  // ------------------------------------------------------------
  // Register Event
  // ------------------------------------------------------------
  registerEvent(eventId: string, userId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { registeredEventIds: eventId },
    });
  }

  unregisterFromEvent(eventId: string, userId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      $pull: { registeredEventIds: eventId },
    });
  }

  async getRegisteredEvents(userId: string) {
    console.log('getRegisteredEvents', userId);
    return this.userModel
      .findById(userId)
      .select('registeredEventIds')
      .lean()
      .then((user) => {
        return user?.registeredEventIds ?? [];
      });
  }

  getRegisteredEventsSelection() {
    return this.getBasicEventInfoSelection().concat(['registeredEventIds']);
  }

  getBasicEventInfoSelection() {
    return [
      'title',
      'description',
      'imageUrl',
      'startDate',
      'startTime',
      'endDate',
      'endTime',
      'hostId',
      'city',
      'locationId',
    ];
  }
}
