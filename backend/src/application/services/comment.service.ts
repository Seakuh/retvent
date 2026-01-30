import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { MongoCommentRepository } from 'src/infrastructure/repositories/mongodb/comment.repository';
import { MongoEventRepository } from 'src/infrastructure/repositories/mongodb/event.repository';
import { CreateCommentDto } from '../../presentation/dtos/create-comment.dto';
import { UserService } from './user.service';
import { IRegionRepository } from '../../core/repositories/region.repository.interface';
@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: MongoCommentRepository,
    private readonly userService: UserService,
    private readonly eventRepository: MongoEventRepository,
    @Inject('IRegionRepository')
    private readonly regionRepository: IRegionRepository,
  ) {}

  getCommentsCountByUserId(userId: string) {
    return this.commentRepository.getCommentsCountByUserId(userId);
  }

  findByUserIdAndAmount(userId: string) {
    return this.commentRepository.findByUserIdAndAmount(userId);
  }
  async createCommentToEvent(
    eventId: string,
    comment: CreateCommentDto,
    userId: string,
  ) {
    // Check if comments are enabled for this event
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    
    // Default to true if undefined (for backward compatibility)
    const commentsEnabled = event.commentsEnabled ?? true;
    if (!commentsEnabled) {
      throw new BadRequestException('Comments are disabled for this event');
    }
    
    if (userId !== 'public') {
      await this.userService.addUserPoints(userId, 5);
    }
    return this.commentRepository.createCommentToEvent(
      eventId,
      comment,
      userId,
    );
  }
  async findByUserId(userId: string) {
    return this.commentRepository.findByUserId(userId);
  }

  async findByEventId(eventId: string) {
    const comments = await this.commentRepository.findByEventId(eventId);
    if (!comments) {
      throw new NotFoundException('Comment not found');
    }
    return comments;
  }

  async findByEventIdWithUser(eventId: string) {
    const comments = await this.commentRepository.findByEventId(eventId);
    if (!comments) {
      throw new NotFoundException('Comment not found');
    }

    return await Promise.all(
      comments.map(async (comment) => {
        const { username, profileImageUrl } =
          await this.userService.getUsernameAndProfilePicture(comment.userId);

        return {
          id: comment.id,
          text: comment.text,
          createdAt: comment.createdAt,
          userId: comment.userId,
          eventId: comment.eventId,
          parentId: comment.parentId,
          likeIds: comment.likeIds || [],
          username: username ?? '',
          profileImageUrl: profileImageUrl ?? '',
        };
      }),
    );
  }

  async likeComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.likeComment(commentId, userId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async unlikeComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.unlikeComment(
      commentId,
      userId,
    );
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async findByPostId(postId: string) {
    const comments = await this.commentRepository.findByPostId(postId);
    const commentsWithUser = await Promise.all(
      comments.map(async (comment) => {
        const user = await this.userService.getUserProfile(comment.userId);
        return {
          ...comment.toObject(),
          username: user.username,
          profileImageUrl: user.profileImageUrl,
        };
      }),
    );
    return commentsWithUser;
  }

  async getLatestComments(limit?: number) {
    return this.commentRepository.getLatestComments(limit || 10);
  }

  async createCommentToPost(postId: string, text: string, userId: string) {
    return this.commentRepository.createCommentToPost(postId, text, userId);
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findCommentById(commentId);
    if (!comment) { 
      throw new NotFoundException('Comment not found');
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this comment');
    }
    return this.commentRepository.delete(commentId);
  }

  async createCommentToRegion(
    regionId: string,
    comment: CreateCommentDto,
    userId: string,
  ) {
    // Prüfe ob Region existiert
    const region = await this.regionRepository.findById(regionId);
    if (!region) {
      throw new NotFoundException('Region not found');
    }

    if (userId !== 'public') {
      await this.userService.addUserPoints(userId, 5);
    }
    return this.commentRepository.createCommentToRegion(
      regionId,
      comment,
      userId,
    );
  }

  async findByRegionId(regionId: string) {
    const comments = await this.commentRepository.findByRegionId(regionId);
    if (!comments || comments.length === 0) {
      return [];
    }
    return comments;
  }

  async findByRegionIdWithUser(regionId: string) {
    const comments = await this.commentRepository.findByRegionId(regionId);
    if (!comments || comments.length === 0) {
      return [];
    }

    return await Promise.all(
      comments.map(async (comment) => {
        const { username, profileImageUrl } =
          await this.userService.getUsernameAndProfilePicture(comment.userId);

        return {
          id: comment.id,
          text: comment.text,
          createdAt: comment.createdAt,
          userId: comment.userId,
          regionId: comment.regionId,
          parentId: comment.parentId,
          likeIds: comment.likeIds || [],
          username: username ?? '',
          profileImageUrl: profileImageUrl ?? '',
        };
      }),
    );
  }
}
