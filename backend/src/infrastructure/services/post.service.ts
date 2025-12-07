import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CommentService } from 'src/application/services/comment.service';
import { CommunityService } from 'src/application/services/community.service';
import { UserService } from 'src/application/services/user.service';
import { MongoPostRepository } from 'src/infrastructure/repositories/mongodb/post.repository';
import { CreatePostDto } from 'src/presentation/dtos/create-post.dto';
import { Post } from '../schemas/post.schema';
import { ImageService } from './image.service';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: MongoPostRepository,
    private readonly communityService: CommunityService,
    private readonly commentService: CommentService,
    private readonly userService: UserService,
    private readonly imageService: ImageService,
  ) {}

  async createCommunityPost(
    createCommunityPostDto: CreatePostDto,
    userId: string,
    images?: Express.Multer.File[],
  ): Promise<Post> {
    const community = await this.communityService.findById(
      createCommunityPostDto.communityId,
    );
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    if (images && images.length > 0) {
      const imageUrls = await Promise.all(
        images.map((image) => this.imageService.uploadImage(image)),
      );
      return this.postRepository.createCommunityPost({
        ...createCommunityPostDto,
        userId,
        feedImageUrls: imageUrls,
      });
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
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    const posts = await this.postRepository.getCommunityPosts(
      communityId,
      offset,
      limit,
    );
    const postsWithUserAndComments = await Promise.all(
      posts.map(async (post) => {
        const user = await this.userService.getUserProfile(post.userId);
        const comments = await this.commentService.findByPostId(post.id);
        return {
          ...post.toObject(),
          authorUsername: user.username,
          authorAvatar: user.profileImageUrl,
          comments: comments,
        };
      }),
    );

    return postsWithUserAndComments;
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

  async findPostById(postId: string) {
    return this.postRepository.findPostById(postId);
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.postRepository.findPostById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this post');
    }
    return this.postRepository.deletePost(postId, userId);
  }
}
