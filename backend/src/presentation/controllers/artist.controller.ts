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
import { EventService } from '../../application/services/event.service';
import { ProfileService } from '../../application/services/profile.service';
import { CreateArtistDto } from '../dtos/create-artist.dto';
@Controller('artists')
export class ArtistController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly eventService: EventService,
  ) {}

  @Get('name')
  async getByName(@Query('name') name: string) {
    console.log('name', name);
    const events = await this.eventService.getEventsByArtistName(name);
    const artistInfo = await this.profileService.getArtistByName(name);
    return {
      artistInfo,
      events,
    };
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
