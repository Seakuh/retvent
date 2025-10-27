export interface IComment {
  id: string;
  text: string;
  createdAt: Date;
  userId: string;
  eventId: string;
  parentId: string;
  likeIds: string[];
}
