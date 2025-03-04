import { Controller, Post, Body } from "@nestjs/common";
import { CreateArtistDto } from "../dtos/create-artist.dto";
import { ArtistService } from "../../application/services/artist.service";
@Controller('artist')
export class AristsController {
    constructor(private readonly artistService: ArtistService) {}

    @Post()
    createArtist(@Body() createArtistDto: CreateArtistDto) {
        return this.artistService.createArtist(createArtistDto);
    }
}