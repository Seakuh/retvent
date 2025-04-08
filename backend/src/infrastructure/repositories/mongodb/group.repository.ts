import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from '../../../core/domain/group';
import { IGroupRepository } from '../../../core/repositories/group.repository.interface';

@Injectable()
export class MongoGroupRepository implements IGroupRepository {
  constructor(@InjectModel('Group') private groupModel: Model<Group>) {}
  findById(id: string): Promise<Group | null> {
    return this.groupModel.findById(id);
  }
  update(id: string, group: Group): Promise<Group | null> {
    return this.groupModel.findByIdAndUpdate(id, group, { new: true });
  }
  delete(id: string): Promise<boolean> {
    return this.groupModel.findByIdAndDelete(id);
  }

  async create(group: Group): Promise<Group> {
    const newGroup = new this.groupModel(group);
    return newGroup.save();
  }

  async createGroup(group: Group): Promise<Group> {
    console.log(group);
    const newGroup = new this.groupModel(group);
    return newGroup.save();
  }

  findByInviteToken(token: string): Promise<Group | null> {
    return this.groupModel.findOne({ inviteToken: token });
  }
}
