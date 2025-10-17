import { Injectable, NotFoundException } from '@nestjs/common';
import { CommunityService } from 'src/application/services/community.service';
import { MongoPostRepository } from 'src/infrastructure/repositories/mongodb/post.repository';
import { CreatePostDto } from 'src/presentation/dtos/create-post.dto';
import { Post } from '../schemas/post.schema';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: MongoPostRepository,
    private readonly communityService: CommunityService,
  ) {}

  async createCommunityPost(
    createCommunityPostDto: CreatePostDto,
    userId: string,
  ): Promise<Post> {
    const community = await this.communityService.findById(
      createCommunityPostDto.communityId,
    );
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return this.postRepository.createCommunityPost({
      ...createCommunityPostDto,
      userId,
    });
  }

  async getCommunityPosts(communityId: string) {
    const community = await this.communityService.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return this.postRepository.getCommunityPosts(communityId);
  }
}
