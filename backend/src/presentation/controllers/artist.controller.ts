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

  // @Post('artist-contact')
  // async createArtistContact(@Body() createArtistDto: CreateArtistDto) {
  //   console.log('createArtistDto', createArtistDto);
  //   const artistContact =
  //     await this.profileService.createArtistContact(createArtistDto);
  //   return artistContact;
  // }

  // create new artist

  generateRandomPassword(length = 20): string {
    let result = '';
    const chars = 'abcdef0123456789';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

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
      password: this.generateRandomPassword(),
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

  @Post('new-v2')
  @UseInterceptors(FileInterceptor('image')) // <-- Wichtig!
  async createV2(
    @Body() createArtistDto: CreateArtistDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const password = this.generateRandomPassword();
    const user = await this.authService.register({
      email: createArtistDto.name + '@gmail.com',
      password: password,
      username: createArtistDto.name,
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const [profile, description, createdEmail, announcement] =
      await this.profileService.createNewArtistV2(
        image,
        createArtistDto,
        user.user.id,
      );
    console.log('#############################password', password);
    return {
      id: profile.id,
      username: profile.username,
      description,
      createdEmail,
      announcement,
      password,
    };
  }
}
