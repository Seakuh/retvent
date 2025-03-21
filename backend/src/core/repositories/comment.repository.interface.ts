import { Comment } from '../domain/comment';

export interface ICommentRepository {
  create(comment: Partial<Comment>): Promise<Comment>;
  findByEventId(eventId: string): Promise<Comment[]>;
  findById(id: string): Promise<Comment | null>;
  update(id: string, comment: Partial<Comment>): Promise<Comment | null>;
  delete(id: string): Promise<boolean>;
}
