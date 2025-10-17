import { Injectable } from '@nestjs/common';
import { CommunityService } from 'src/application/services/community.service';
import { CreateCommunityPostDto } from 'src/presentation/dtos/create-community-post.dto';
import { MongoPostRepository } from '../repositories/mongodb/post.repository';
import { Post } from '../schemas/post.schema';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: MongoPostRepository,
    communityService: CommunityService,
  ) {}

  async createCommunityPost(
    createCommunityPostDto: CreateCommunityPostDto,
  ): Promise<Post> {
    return this.postRepository.createCommunityPost(createCommunityPostDto);
  }
}
