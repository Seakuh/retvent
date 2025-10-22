import { IMessage } from './interfaces/message.interface';

export class Message implements IMessage {
  groupId?: string;
  recipientId?: string;
  senderId?: string;
  content?: string;
  type?: string;
  createdAt?: Date;
  fileUrl?: string;
  latitude?: number;
  longitude?: number;
  isPrivate?: boolean;
}
