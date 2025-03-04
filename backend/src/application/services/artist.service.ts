import { Injectable } from "@nestjs/common";
import { CreateArtistDto } from "../../presentation/dtos/create-artist.dto";
import { MongoArtistRepository } from "../../infrastructure/repositories/mongodb/artist.repository";
@Injectable()
export class ArtistService {
    constructor(private readonly artistRepository: MongoArtistRepository) {}

    async createArtist(createArtistDto: CreateArtistDto) {
        return this.artistRepository.create(createArtistDto);
    }
}