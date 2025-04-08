import { Group } from '../domain/group';

export interface IGroupRepository {
  createGroup(userId: string, group: Group): Promise<Group>;
  createGroupWithEvent(group: Group): Promise<Group>;
  findById(id: string): Promise<Group | null>;
  update(id: string, group: Group): Promise<Group | null>;
  delete(id: string): Promise<boolean>;
}
