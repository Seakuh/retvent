import { Injectable } from '@nestjs/common';
import { IMessageRepository } from 'src/core/repositories/message.repository.interface';
@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async create(groupId: string, senderId: string, content: string) {
    const msg = await this.messageRepository.create({
      groupId,
      senderId,
      content,
    });
    return msg;
  }

  async findByGroup(groupId: string, limit = 50) {
    return this.messageRepository.findByGroupId(groupId, limit);
  }

  async findByGroupAndSender(groupId: string, senderId: string) {
    return this.messageRepository.findByGroupIdAndSenderId(groupId, senderId);
  }

  async findByGroupAndSenderAndContent(
    groupId: string,
    senderId: string,
    content: string,
  ) {
    return this.messageRepository.findByGroupIdAndSenderIdAndContent(
      groupId,
      senderId,
      content,
    );
  }
}
