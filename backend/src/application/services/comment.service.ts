import { Injectable } from '@nestjs/common';
import { MongoCommentRepository } from 'src/infrastructure/repositories/mongodb/comment.repository';
import { CreateCommentDto } from '../../presentation/dtos/create-comment.dto';
import { UserService } from './user.service';
@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: MongoCommentRepository,
    private readonly userService: UserService,
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
    return this.commentRepository.findByEventId(eventId);
  }

  async findByPostId(postId: string) {
    return this.commentRepository.findByPostId(postId);
  }

  async getLatestComments(limit?: number) {
    return this.commentRepository.getLatestComments(limit || 10);
  }

  async createCommentToPost(postId: string, text: string, userId: string) {
    return this.commentRepository.createCommentToPost(postId, text, userId);
  }
}
