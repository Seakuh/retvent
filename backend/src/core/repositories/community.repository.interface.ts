import { CreateCommunityDto } from 'src/presentation/dtos/create-community.dto';
import { Community } from '../domain/community';

export interface ICommunityRepository {
  createCommunity(body: CreateCommunityDto): Promise<Community>;
  findById(id: string): Promise<Community | null>;
  findAll(): Promise<Community[]>;
  update(id: string, body: CreateCommunityDto): Promise<Community | null>;
  delete(id: string): Promise<boolean>;
}
