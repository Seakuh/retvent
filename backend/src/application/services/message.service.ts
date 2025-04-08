import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class MessageService {
  constructor(@InjectModel('Message') private messageModel: Model<any>) {}

  async create(groupId: string, senderId: string, content: string) {
    const msg = new this.messageModel({ groupId, senderId, content });
    return msg.save();
  }

  async findByGroup(groupId: string, limit = 50) {
    return this.messageModel
      .find({ groupId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}
