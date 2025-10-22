import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from 'src/core/domain/message';
import { IMessageRepository } from 'src/core/repositories/message.repository.interface';

@Injectable()
export class MongoMessageRepository implements IMessageRepository {
  constructor(@InjectModel('Message') private messageModel: Model<Message>) {}

  async create(message: Message): Promise<Message> {
    console.log('################message', message);
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

  async findPrivateMessagesBetweenUsers(
    userId1: string,
    userId2: string,
    limit = 50,
  ): Promise<Message[]> {
    return this.messageModel
      .find({
        isPrivate: true,
        $or: [
          { senderId: userId1, recipientId: userId2 },
          { senderId: userId2, recipientId: userId1 },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async findPrivateMessagesForUser(
    userId: string,
    limit = 50,
  ): Promise<Message[]> {
    return this.messageModel
      .find({
        isPrivate: true,
        $or: [{ senderId: userId }, { recipientId: userId }],
      })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}
