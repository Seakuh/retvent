import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Artist } from "src/infrastructure/schemas/artist.schema";
import { CreateArtistDto } from "src/presentation/dtos/create-artist.dto";

@Injectable()
export class MongoArtistRepository {
    constructor(
        @InjectModel('Artist') private artistModel: Model<Artist>
    ) {}

    async create(artistData: CreateArtistDto): Promise<Artist> {
        const createdArtist = new this.artistModel(artistData);
        return createdArtist.save();
    }
}