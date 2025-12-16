import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Community } from 'src/core/domain/community';
import { MongoProfileRepository } from 'src/infrastructure/repositories/mongodb/profile.repository';
import { MongoUserRepository } from 'src/infrastructure/repositories/mongodb/user.repository';
import { CreateCommunityDto } from 'src/presentation/dtos/create-community.dto';
import { UpdateCommunityDto } from 'src/presentation/dtos/update-community.dto';
import { MongoCommunityRepository } from '../../infrastructure/repositories/mongodb/community.repository';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityRepository: MongoCommunityRepository,
    private readonly userRepository: MongoUserRepository,
    private readonly profileRepository: MongoProfileRepository,
  ) {}

  async getCommunities() {
    return this.communityRepository.findAll();
  }

  async createCommunity(body: CreateCommunityDto, userId?: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const communityData = {
      ...body,
      admins: [userId],
      moderators: [userId],
      creatorId: userId || null,
      members: [userId],
      bannedUsers: [],
      eventIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.communityRepository.createCommunity(communityData);
  }

  async joinCommunity(
    { communityId }: { communityId: string },
    userId: string,
  ) {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return this.communityRepository.joinCommunity(communityId, userId);
  }

  async getMembers(communityId: string) {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const members = await this.profileRepository.findByIds(community.members);

    return members.map((member) => ({
      id: member.userId,
      username: member.username,
      email: member.email || '',
      profileImageUrl: member.profileImageUrl,
    }));
  }

  async findById(id: string): Promise<Community | null> {
    const community = await this.communityRepository.findById(id);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return community;
  }

  updateCommunity(communityId: string, body: UpdateCommunityDto) {
    return this.communityRepository.update(communityId, body);
  }

  addModerator(communityId: string, userId: string) {
    return this.communityRepository.addModerator(communityId, userId);
  }

  addMember(communityId: string, userId: string) {
    return this.communityRepository.addMember(communityId, userId);
  }

  removeModerator(communityId: string, userId: string) {
    return this.communityRepository.removeModerator(communityId, userId);
  }

  async deleteCommunity(communityId: string, userId: string) {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    if (!community.admins.includes(userId)) {
      throw new ForbiddenException('You are not the admin of this community');
    }
    return this.communityRepository.delete(communityId);
  }

  async addEventToCommunity(communityId: string, eventId: string): Promise<Community | null> {
    return this.communityRepository.addEventToCommunity(communityId, eventId);
  }

  async removeEventFromCommunity(communityId: string, eventId: string): Promise<Community | null> {
    return this.communityRepository.removeEventFromCommunity(communityId, eventId);
  }

  async checkUserCanCreateEvent(communityId: string, userId: string): Promise<boolean> {
    const community = await this.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    return community.moderators.includes(userId) || community.admins.includes(userId);
  }
}
