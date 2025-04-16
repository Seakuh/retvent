import { Injectable } from '@nestjs/common';
import { Profile } from 'src/core/domain/profile';
import { MongoFeedRepository } from '../../infrastructure/repositories/mongodb';

@Injectable()
export class FeedService {
  constructor(private readonly feedRepository: MongoFeedRepository) {}

  async getProfileFeed(
    id: string,
    limit: number,
    offset: number,
  ): Promise<Profile[]> {
    const feed = await this.feedRepository.findByProfileId(id);
    return [];
  }
}
