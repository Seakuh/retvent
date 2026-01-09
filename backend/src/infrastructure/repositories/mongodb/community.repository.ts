import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICommunityRepository } from 'src/core/repositories/community.repository.interface';
import { CreateCommunityDto } from 'src/presentation/dtos/create-community.dto';
import { Community } from '../../../core/domain/community';

@Injectable()
export class MongoCommunityRepository implements ICommunityRepository {
  constructor(
    @InjectModel('Community') private communityModel: Model<Community>,
  ) {}

  async createCommunity(body: CreateCommunityDto) {
    const community = new this.communityModel(body);
    return community.save();
  }

  async findById(id: string) {
    return this.communityModel.findById(id);
  }

  async findAll() {
    return this.communityModel.find();
  }

  async update(id: string, body: Partial<Community>) {
    return this.communityModel.findByIdAndUpdate(id, body, { new: true });
  }

  async joinCommunity(id: string, userId: string) {
    return this.communityModel.findByIdAndUpdate(
      id,
      { $push: { members: userId } },
      { new: true },
    );
  }

  async delete(id: string) {
    const result = await this.communityModel.findByIdAndDelete(id);
    return result !== null;
  }

  async addModerator(communityId: string, userId: string) {
    return this.communityModel.findByIdAndUpdate(
      communityId,
      { $push: { moderators: userId } },
      { new: true },
    );
  }

  removeModerator(communityId: string, userId: string) {
    return this.communityModel.findByIdAndUpdate(
      communityId,
      { $pull: { moderators: userId } },
      { new: true },
    );
  }

  async addMember(communityId: string, userId: string) {
    return this.communityModel.findByIdAndUpdate(
      communityId,
      { $push: { members: userId } },
      { new: true },
    );
  }

  async addEventToCommunity(communityId: string, eventId: string) {
    return this.communityModel.findByIdAndUpdate(
      communityId,
      { $addToSet: { eventIds: eventId } },
      { new: true },
    );
  }

  async removeEventFromCommunity(communityId: string, eventId: string) {
    return this.communityModel.findByIdAndUpdate(
      communityId,
      { $pull: { eventIds: eventId } },
      { new: true },
    );
  }

  /**
   * Pinnt ein Event an die Community-Posts (nur für Admins)
   * @param communityId - ID der Community
   * @param eventId - ID des Events, das gepinnt werden soll
   * @returns Aktualisierte Community oder null wenn nicht gefunden
   */
  async pinEventToCommunity(communityId: string, eventId: string) {
    return this.communityModel.findByIdAndUpdate(
      communityId,
      { $addToSet: { pinnedEventIds: eventId } },
      { new: true },
    );
  }

  /**
   * Entfernt ein Event aus den gepinnten Events einer Community
   * @param communityId - ID der Community
   * @param eventId - ID des Events, das entpinnt werden soll
   * @returns Aktualisierte Community oder null wenn nicht gefunden
   */
  async unpinEventFromCommunity(communityId: string, eventId: string) {
    return this.communityModel.findByIdAndUpdate(
      communityId,
      { $pull: { pinnedEventIds: eventId } },
      { new: true },
    );
  }

  /**
   * Gibt alle gepinnten Event-IDs einer Community zurück
   * @param communityId - ID der Community
   * @returns Array von Event-IDs oder leeres Array
   */
  async getPinnedEvents(communityId: string): Promise<string[]> {
    const community = await this.communityModel.findById(communityId);
    return community?.pinnedEventIds || [];
  }
}
