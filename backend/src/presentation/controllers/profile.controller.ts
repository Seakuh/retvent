import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProfileService } from 'src/application/services/profile.service';
import { IProfile } from 'src/core/domain/Profile';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string): Promise<IProfile> {
    return this.profileService.getProfile(id);
  }

  @Post()
  async createProfile(@Body() profile: IProfile): Promise<IProfile> {
    return this.profileService.createProfile(profile);
  }

  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() profile: IProfile,
  ): Promise<IProfile> {
    return this.profileService.updateProfile(id, profile);
  }

  @Delete(':id')
  async deleteProfile(@Param('id') id: string): Promise<boolean> {
    return this.profileService.deleteProfile(id);
  }

  @Get('user/:userId')
  async getProfileByUserId(@Param('userId') userId: string): Promise<IProfile> {
    return this.profileService.findByUserId(userId);
  }

  @Get('username/:username')
  async getProfileByUsername(
    @Param('username') username: string,
  ): Promise<IProfile> {
    return this.profileService.findByUsername(username);
  }

  @Get('email/:email')
  async getProfileByEmail(@Param('email') email: string): Promise<IProfile> {
    return this.profileService.findByEmail(email);
  }

  @Put('profile-picture/:id')
  async updateProfilePicture(
    @Param('id') id: string,
    @Body() profilePictureUrl: string,
  ): Promise<IProfile> {
    return this.profileService.updateProfilePicture(id, profilePictureUrl);
  }

  @Put('links/:id')
  async updateProfileLinks(
    @Param('id') id: string,
    @Body() links: string[],
  ): Promise<IProfile> {
    return this.profileService.updateProfileLinks(id, links);
  }

  @Put('door-policy/:id')
  async updateProfileDoorPolicy(
    @Param('id') id: string,
    @Body() doorPolicy: string,
  ): Promise<IProfile> {
    return this.profileService.updateProfileDoorPolicy(id, doorPolicy);
  }

  @Put('category/:id')
  async updateProfileCategory(
    @Param('id') id: string,
    @Body() category: string,
  ): Promise<IProfile> {
    return this.profileService.updateProfileCategory(id, category);
  }
}
