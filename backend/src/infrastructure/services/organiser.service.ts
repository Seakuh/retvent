import { Injectable } from '@nestjs/common';
import { MongoOrganiserRepository } from '../repositories/mongodb/organiser.repository';
import { Organiser } from '../schemas/organiser.schema';
import { CreateOrganiserDto } from 'src/presentation/dtos/create-organiser.dto';

@Injectable()
export class OrganiserService {
  constructor(private readonly organiserRepository: MongoOrganiserRepository) {}

  async createOrganiser(
    createOrganiserDto: CreateOrganiserDto,
  ): Promise<Organiser> {
    return this.organiserRepository.create(createOrganiserDto);
  }
  async findByHost(host: string) {
    return this.organiserRepository.findByHost(host);
  }
  async updateOrganiser(
    id: string,
    updateOrganiserDto: CreateOrganiserDto,
  ): Promise<Organiser> {
    return this.organiserRepository.edit(id, updateOrganiserDto);
  }
}
