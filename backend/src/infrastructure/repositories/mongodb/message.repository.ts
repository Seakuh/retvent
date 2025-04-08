import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Message } from 'src/core/domain/message';
import { IMessageRepository } from 'src/core/repositories/message.repository.interface';

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(private readonly messageModel: Model<Message>) {}

  async create(message: Message): Promise<Message> {
    const newMessage = new this.messageModel(message);
    return newMessage.save();
  }

  async findByGroupId(groupId: string, limit = 50): Promise<Message[]> {
    return this.messageModel
      .find({ groupId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async findByGroupIdAndSenderId(
    groupId: string,
    senderId: string,
  ): Promise<Message[]> {
    return this.messageModel.find({ groupId, senderId });
  }

  async findByGroupIdAndSenderIdAndContent(
    groupId: string,
    senderId: string,
    content: string,
  ): Promise<Message[]> {
    return this.messageModel.find({ groupId, senderId, content });
  }

  async findByGroupIdAndSenderIdAndContentAndType(
    groupId: string,
    senderId: string,
    content: string,
    type: string,
  ): Promise<Message[]> {
    return this.messageModel.find({ groupId, senderId, content, type });
  }
}
