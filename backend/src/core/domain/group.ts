import { IGroup } from './interfaces/group.interface';

export class Group implements IGroup {
  id?: string;
  name?: string;
  description?: string;
  memberIds: string[];
  creatorId: string;
  eventIds?: string[];
  imageUrl?: string;
  inviteToken?: string;
  isPublic?: boolean;
  isPrivate?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GroupServicePort {
  createGroup(group: Group): Promise<Group>;
  getGroupById(id: string): Promise<Group>;
  updateGroup(group: Group): Promise<Group>;
  deleteGroup(id: string): Promise<boolean>;
}
