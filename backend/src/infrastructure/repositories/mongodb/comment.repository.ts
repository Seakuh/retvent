import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from 'src/presentation/dtos/create-comment.dto';
import { Comment as DomainComment } from '../../../core/domain/comment';
import { ICommentRepository } from '../../../core/repositories/comment.repository.interface';

@Injectable()
export class MongoCommentRepository implements ICommentRepository {
  constructor(
    @InjectModel(DomainComment.name)
    private commentModel: Model<DomainComment>,
  ) {
    // Erstelle Index für schnelle Zählung
    this.commentModel.collection.createIndex({ eventId: 1 });
  }
  async findByUserIdAndAmount(userId: string) {
    const comments = await this.commentModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);
    const count = await this.commentModel.countDocuments({ userId });
    return { comments, count };
  }

  getCommentsCountByUserId(userId: string) {
    return this.commentModel.countDocuments({ userId });
  }
  createCommentToEvent(
    eventId: string,
    comment: CreateCommentDto,
    userId: string,
  ) {
    return this.commentModel.create({
      ...comment,
      eventId,
      userId,
      createdAt: new Date(),
    });
  }
  async findById(id: string): Promise<DomainComment | null> {
    return this.commentModel.findById(id);
  }

  async update(
    id: string,
    comment: Partial<DomainComment>,
  ): Promise<DomainComment | null> {
    return this.commentModel.findByIdAndUpdate(id, comment, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.commentModel.findByIdAndDelete(id);
    return result !== null;
  }

  async create(comment: Partial<DomainComment>): Promise<DomainComment> {
    return this.commentModel.create(comment);
  }

  async findByEventId(eventId: string): Promise<DomainComment[]> {
    return this.commentModel.find({ eventId });
  }

  async countCommentsByEventId(eventId: string): Promise<number> {
    return this.commentModel.countDocuments({ eventId });
  }

  async findByUserId(userId: string) {
    return this.commentModel.find({ userId });
  }

  async findByEventIdWithCount(eventId: string) {
    const [comments, total] = await Promise.all([
      this.commentModel.find({ eventId }).sort({ createdAt: -1 }).lean(),
      this.commentModel.countDocuments({ eventId }),
    ]);

    return {
      comments,
      total,
    };
  }

  async findByUsernameAndAmount(username: string) {
    const [comments, total] = await Promise.all([
      this.commentModel.find({ username }).sort({ createdAt: -1 }).lean(),
      this.commentModel.countDocuments({ username }),
    ]);
    return { comments, total };
  }

  async getLatestComments(limit?: number) {
    return this.commentModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit || 10);
  }
}
