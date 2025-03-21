import { Injectable } from '@nestjs/common';
import { MongoCommentRepository } from 'src/infrastructure/repositories/mongodb/comment.repository';
import { CreateCommentDto } from '../../presentation/dtos/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: MongoCommentRepository) {}

  createCommentToEvent(
    eventId: string,
    comment: CreateCommentDto,
    userId: string,
  ) {
    return this.commentRepository.createCommentToEvent(
      eventId,
      comment,
      userId,
    );
  }

  async findByEventId(eventId: string) {
    return this.commentRepository.findByEventId(eventId);
  }
}
