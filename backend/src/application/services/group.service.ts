import { NotFoundException } from '@nestjs/common';
import { MongoGroupRepository } from 'src/infrastructure/repositories/mongodb/group.repository';
import { CreateGroupDto } from 'src/presentation/dtos/create-group.dto';
import { UpdateGroupDto } from 'src/presentation/dtos/update-group.dto';
import { v4 as uuidv4 } from 'uuid';

export class GroupService {
  constructor(private readonly groupRepository: MongoGroupRepository) {}

  async createGroup(userId: string, dto: CreateGroupDto) {
    console.log('userid: ', userId);
    const inviteToken = uuidv4();
    return await this.groupRepository.createGroup({
      creatorId: userId,
      memberIds: [userId],
      inviteToken,
    });
  }

  async createGroupWithEvent(userId: string, dto: CreateGroupDto) {
    const inviteToken = uuidv4();
    console.log(dto, userId);
    return await this.groupRepository.create({
      name: dto.name,
      creatorId: userId,
      memberIds: [userId],
      inviteToken,
    });
  }

  async joinGroup(userId: string, token: string) {
    const group = await this.groupRepository.findByInviteToken(token);
    if (!group) throw new NotFoundException('Group not found');
    if (!group.memberIds.includes(userId)) {
      group.memberIds.push(userId);
      await this.groupRepository.update(group.id, group);
    }
    return group;
  }

  async leaveGroup(userId: string, groupId: string) {
    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    group.memberIds = group.memberIds.filter((id) => id !== userId);
    return this.groupRepository.update(groupId, group);
  }

  async getGroupById(groupId: string) {
    return this.groupRepository.findById(groupId);
  }

  async updateGroup(groupId: string, dto: UpdateGroupDto) {
    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    group.name = dto.name;
    group.description = dto.description;
    group.isPublic = dto.isPublic;
    return this.groupRepository.update(groupId, group);
  }

  async deleteGroup(groupId: string) {
    const result = await this.groupRepository.delete(groupId);
    return result !== null;
  }
}
