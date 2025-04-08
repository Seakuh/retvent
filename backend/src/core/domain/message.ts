import { IMessage } from './interfaces/message.interface';

export class Message implements IMessage {
  groupId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: Date;
}
