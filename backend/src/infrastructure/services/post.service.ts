import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentService } from 'src/application/services/comment.service';
import { CommunityService } from 'src/application/services/community.service';
import { MongoPostRepository } from 'src/infrastructure/repositories/mongodb/post.repository';
import { CreatePostDto } from 'src/presentation/dtos/create-post.dto';
import { Post } from '../schemas/post.schema';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: MongoPostRepository,
    private readonly communityService: CommunityService,
    private readonly commentService: CommentService,
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

  async getComments(postId: string) {
    return this.commentService.findByPostId(postId);
  }

  async getCommunityPosts(communityId: string, offset: number, limit: number) {
    const community = await this.communityService.findById(communityId);
    console.log('communityId', communityId);
    console.log('community', community);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return this.postRepository.getCommunityPosts(communityId, offset, limit);
  }

  async createComment(
    communityId: string,
    postId: string,
    text: string,
    userId: string,
  ) {
    const community = await this.communityService.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return this.commentService.createCommentToPost(postId, text, userId);
  }

  async addLike(postId: string, userId: string) {
    return this.postRepository.addLike(postId, userId);
  }

  async removeLike(postId: string, userId: string) {
    return this.postRepository.removeLike(postId, userId);
  }
}
