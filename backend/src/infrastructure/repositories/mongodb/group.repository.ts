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
  getGroupsByUserId(userId: string) {
    return this.groupModel.find({ memberIds: userId }).sort({ updatedAt: -1 });
  }
  update(id: string, group: Group): Promise<Group | null> {
    return this.groupModel.findByIdAndUpdate(id, group, { new: true });
  }
  delete(id: string): Promise<boolean> {
    return this.groupModel.findByIdAndDelete(id);
  }

  async createGroup(userId: string, group: Partial<Group>): Promise<Group> {
    const groupToSave = {
      name: group.name,
      description: group.description,
      isPublic: group.isPublic,
      memberIds: [userId],
      creatorId: userId,
      eventId: group.eventId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newGroup = new this.groupModel(groupToSave);
    const savedGroup = await newGroup.save();
    console.log('savedGroup: ', savedGroup);
    return savedGroup;
  }

  async createGroupWithEvent(group: Group): Promise<Group> {
    console.log(group);
    const newGroup = new this.groupModel(group);
    return newGroup.save();
  }

  findByInviteToken(token: string): Promise<Group | null> {
    return this.groupModel.findOne({ inviteToken: token });
  }
}
