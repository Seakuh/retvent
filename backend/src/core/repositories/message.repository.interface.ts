import { Message } from '../domain/message';

export interface IMessageRepository {
  create(message: Message): Promise<Message>;
  findByGroupId(groupId: string, limit?: number | 50): Promise<Message[]>;
  findByGroupIdAndSenderId(
    groupId: string,
    senderId: string,
  ): Promise<Message[]>;
  findByGroupIdAndSenderIdAndContent(
    groupId: string,
    senderId: string,
    content: string,
  ): Promise<Message[]>;
  findByGroupIdAndSenderIdAndContentAndType(
    groupId: string,
    senderId: string,
    content: string,
    type: string,
  ): Promise<Message[]>;
}
