import { Injectable } from "@nestjs/common";
import { MongoGrooveCastRepository } from "../repositories/mongodb/groovecast.repository";

@Injectable()
export class GroovecastService {
  constructor(private readonly groovecastRepository: MongoGrooveCastRepository) {}


}
