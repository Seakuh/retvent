import { Injectable } from '@nestjs/common';
import { CreateCommunityDto } from 'src/presentation/dtos/create-community.dto';
import { MongoCommunityRepository } from '../../infrastructure/repositories/mongodb/community.repository';

@Injectable()
export class CommunityService {
  constructor(private readonly communityRepository: MongoCommunityRepository) {}

  async getCommunities() {
    return 'Communities';
  }

  async createCommunity(body: CreateCommunityDto) {
    return this.communityRepository.createCommunity(body);
  }
}
