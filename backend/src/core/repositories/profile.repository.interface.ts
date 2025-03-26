import { Profile } from '../domain/profile';
export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>;
  findByUsername(username: string): Promise<Profile | null>;
  findByUserId(userId: string): Promise<Profile | null>;
  updateProfilePicture(
    id: string,
    profilePictureUrl: string,
  ): Promise<Profile | null>;
  updateProfileLinks(id: string, links: string[]): Promise<Profile | null>;

  create(event: Partial<Profile>): Promise<Profile>;
  findBySlug(slug: string): Promise<Profile | null>;
  delete(id: string): Promise<boolean>;
  findByHostId(hostId: string): Promise<Event[]>;
}
