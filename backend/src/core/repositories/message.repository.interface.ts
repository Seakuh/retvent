import { Message } from '../domain/message';

export interface IMessageRepository {
  create(message: Message): Promise<Message>;
  findByGroupId(groupId: string): Promise<Message[]>;
}
