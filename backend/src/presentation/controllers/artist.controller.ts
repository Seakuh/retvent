import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FileInterceptor('image')) // <-- Wichtig!
  async create(
    @Body() createArtistDto: CreateArtistDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    console.log('createArtistDto', createArtistDto);
    console.log('image', image);
    return this.profileService.createNewArtist(image, createArtistDto);
  }
}
