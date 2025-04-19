import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { ProfileService } from '../../application/services/profile.service';
import { CreateArtistDto } from '../dtos/create-artist.dto';

@Controller('artists')
export class ArtistController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('name')
  async getByName(@Query('name') name: string) {
    console.log('name', name);
    return this.profileService.getProfileByName(name);
  }

  // create new artist
  @Post('new')
  async create(
    @Body() createArtistDto: CreateArtistDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.profileService.createNewArtist(image, createArtistDto);
  }
}
