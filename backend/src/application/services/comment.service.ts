import { Injectable, NotFoundException } from '@nestjs/common';
import { MongoCommentRepository } from 'src/infrastructure/repositories/mongodb/comment.repository';
import { CreateCommentDto } from '../../presentation/dtos/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: MongoCommentRepository) {}

  async create(dto: CreateCommentDto) {
    const { text, userId, eventId, parentId } = dto;

    // Optional: Check if parentId exists if provided
    if (parentId) {
      const parentComment = await this.commentRepository.findById(parentId);
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const newComment = await this.commentRepository.create({
      text,
      userId,
      eventId,
      parentId: parentId || null,
      createdAt: undefined,
    });

    return newComment;
  }

  async findByEventId(eventId: string) {
    return this.commentRepository.findByEventId(eventId);
  }
}
