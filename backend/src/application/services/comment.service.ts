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
}
