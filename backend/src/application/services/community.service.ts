import { Injectable, NotFoundException } from '@nestjs/common';
import { MongoUserRepository } from 'src/infrastructure/repositories/mongodb/user.repository';
import { CreateCommunityDto } from 'src/presentation/dtos/create-community.dto';
import { JoinCommunityDto } from 'src/presentation/dtos/join-community.dto';
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
    };

    return this.communityRepository.createCommunity(communityData);
  }

  async joinCommunity(body: JoinCommunityDto, userId: string) {
    const community = await this.communityRepository.findById(body.communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return this.communityRepository.joinCommunity(body.communityId, userId);
  }
}
