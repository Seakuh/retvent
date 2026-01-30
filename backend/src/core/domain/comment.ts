import { IComment } from './interfaces/comment.interface';

export class Comment implements IComment {
  id: string;
  text: string;
  createdAt: Date;
  userId: string;
  eventId?: string;
  regionId?: string;
  parentId: string;
  postId?: string;
  likeIds: string[];
  constructor(data: Partial<IComment>) {
    Object.assign(this, data);
  }
}
