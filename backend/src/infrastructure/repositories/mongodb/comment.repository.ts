import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment as DomainComment } from '../../../core/domain/comment';
import { ICommentRepository } from '../../../core/repositories/comment.repository.interface';

@Injectable()
export class MongoCommentRepository implements ICommentRepository {
  constructor(
    @InjectModel(DomainComment.name)
    private commentModel: Model<DomainComment>,
  ) {}

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
}
