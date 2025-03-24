import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IFollowerRepository } from 'src/core/repositories/follower.repository.interface';

@Injectable()
export class FollowService {
  constructor(
    @Inject('IFollowerRepository')
    private readonly followerRepository: IFollowerRepository,
  ) {}

  async follow(followerId: string, followingId: string) {
    const existingFollower =
      await this.followerRepository.findByFollowerId(followerId);
    if (existingFollower) {
      throw new BadRequestException('User already followed');
    }
    return this.followerRepository.create({
      followerId,
      followedId: followingId,
      createdAt: new Date(),
    });
  }

  async unfollow(followerId: string, followingId: string) {
    return this.followerRepository.delete({
      followerId,
      followedId: followingId,
      createdAt: new Date(),
    });
  }

  async getFollowers(userId: string) {
    return this.followerRepository.findByFollowedId(userId);
  }

  async getFollowing(userId: string) {
    return this.followerRepository.findByFollowedId(userId);
  }
}
