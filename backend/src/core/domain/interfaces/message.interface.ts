export interface IMessage {
  groupId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: Date;
}
