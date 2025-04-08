import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Group } from 'src/core/domain/group';
import { CreateGroupDto } from 'src/presentation/dtos/create-group.dto';
import { UpdateGroupDto } from 'src/presentation/dtos/update-group.dto';
import { v4 as uuidv4 } from 'uuid';

export class GroupService {
  constructor(private readonly groupModel: Model<Group>) {}

  async createGroup(userId: string, dto: CreateGroupDto) {
    const inviteToken = uuidv4(); // sicheres Token
    const newGroup = new this.groupModel({
      name: dto.name,
      creatorId: userId,
      memberIds: [userId],
      eventId: dto.eventId,
      inviteToken,
    });

    return newGroup.save();
  }

  async joinGroup(userId: string, token: string) {
    const group = await this.groupModel.findOne({ inviteToken: token });
    if (!group) throw new NotFoundException('Group not found');
    if (!group.memberIds.includes(userId)) {
      group.memberIds.push(userId);
      await group.save();
    }
    return group;
  }

  async leaveGroup(userId: string, groupId: string) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    group.memberIds = group.memberIds.filter((id) => id !== userId);
    return group.save();
  }

  async getGroupById(groupId: string) {
    return this.groupModel.findById(groupId);
  }

  async updateGroup(groupId: string, dto: UpdateGroupDto) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    group.name = dto.name;
    group.description = dto.description;
    group.isPublic = dto.isPublic;
    return group.save();
  }

  async deleteGroup(groupId: string) {
    const result = await this.groupModel.findByIdAndDelete(groupId);
    return result !== null;
  }
}
