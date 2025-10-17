import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Community } from 'src/core/domain/community';
import { MongoUserRepository } from 'src/infrastructure/repositories/mongodb/user.repository';
import { CreateCommunityDto } from 'src/presentation/dtos/create-community.dto';
import { UpdateCommunityDto } from 'src/presentation/dtos/update-community.dto';
import { MongoCommunityRepository } from '../../infrastructure/repositories/mongodb/community.repository';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityRepository: MongoCommunityRepository,
    private readonly userRepository: MongoUserRepository,
  ) {}

  async getCommunities() {
    return this.communityRepository.findAll();
  }

  async createCommunity(body: CreateCommunityDto, userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const communityData = {
      ...body,
      admins: [userId],
      moderators: [userId],
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
}
