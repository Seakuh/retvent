import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICommunityRepository } from 'src/core/repositories/community.repository.interface';
import { CreateCommunityDto } from 'src/presentation/dtos/create-community.dto';
import { Community } from '../../../core/domain/community';

@Injectable()
export class MongoCommunityRepository implements ICommunityRepository {
  constructor(
    @InjectModel('Community') private communityModel: Model<Community>,
  ) {}

  async createCommunity(body: CreateCommunityDto) {
    const community = new this.communityModel(body);
    return community.save();
  }

  async findById(id: string) {
    return this.communityModel.findById(id);
  }

  async findAll() {
    return this.communityModel.find();
  }

  async update(id: string, body: CreateCommunityDto) {
    return this.communityModel.findByIdAndUpdate(id, body);
  }

  async delete(id: string) {
    const result = await this.communityModel.findByIdAndDelete(id);
    return result !== null;
  }
}
