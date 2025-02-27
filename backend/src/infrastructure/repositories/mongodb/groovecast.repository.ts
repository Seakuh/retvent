import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GrooveCast } from "src/core/domain/GrooveCast";

@Injectable()
export class MongoGrooveCastRepository {
  constructor(
    @InjectModel('GrooveCast') private eventModel: Model<GrooveCast>
  ) {
    
  }
  
  async findAll(): Promise<GrooveCast[]> {
    return this.eventModel.find().exec();
  }

  findBySeason(season: string): Promise<GrooveCast[]> {
    return this.eventModel.find({ season: season }).exec();
  }

  async create(groovecast: GrooveCast): Promise<GrooveCast> {
    return this.eventModel.create(groovecast);
  }

}