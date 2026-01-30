export interface IComment {
  id: string;
  text: string;
  createdAt: Date;
  userId: string;
  eventId?: string;
  regionId?: string;
  parentId: string;
  likeIds: string[];
}
