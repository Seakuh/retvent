import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomBytes } from 'crypto';
import { EventService } from '../../application/services/event.service';
import { ProfileService } from '../../application/services/profile.service';
import { AuthService } from '../../infrastructure/services/auth.service';
import { CreateArtistDto } from '../dtos/create-artist.dto';
@Controller('artists')
export class ArtistController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly eventService: EventService,
    private readonly authService: AuthService,
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
    const user = await this.authService.register({
      email: createArtistDto.name + '@gmail.com',
      password: randomBytes(10).toString('hex'),
      username: createArtistDto.name,
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const profile = await this.profileService.createNewArtist(
      image,
      createArtistDto,
      user.user.id,
    );
    return profile;
  }
}
