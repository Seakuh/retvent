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
import { Profile } from 'src/core/domain/profile';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string): Promise<Profile> {
    return this.profileService.getProfile(id);
  }

  @Post()
  async createProfile(@Body() profile: Profile): Promise<Profile> {
    return this.profileService.createProfile(profile);
  }

  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() profile: Profile,
  ): Promise<Profile> {
    return this.profileService.updateProfile(id, profile);
  }

  @Delete(':id')
  async deleteProfile(@Param('id') id: string): Promise<boolean> {
    return this.profileService.deleteProfile(id);
  }

  @Get('user/:userId')
  async getProfileByUserId(@Param('userId') userId: string): Promise<Profile> {
    return this.profileService.findByUserId(userId);
  }

  @Get('username/:username')
  async getProfileByUsername(
    @Param('username') username: string,
  ): Promise<Profile> {
    return this.profileService.findByUsername(username);
  }

  @Get('email/:email')
  async getProfileByEmail(@Param('email') email: string): Promise<Profile> {
    return this.profileService.findByEmail(email);
  }

  @Put('profile-picture/:id')
  async updateProfilePicture(
    @Param('id') id: string,
    @Body() profilePictureUrl: string,
  ): Promise<Profile> {
    return this.profileService.updateProfilePicture(id, profilePictureUrl);
  }

  @Put('links/:id')
  async updateProfileLinks(
    @Param('id') id: string,
    @Body() links: string[],
  ): Promise<Profile> {
    return this.profileService.updateProfileLinks(id, links);
  }

  @Put('door-policy/:id')
  async updateProfileDoorPolicy(
    @Param('id') id: string,
    @Body() doorPolicy: string,
  ): Promise<Profile> {
    return this.profileService.updateProfileDoorPolicy(id, doorPolicy);
  }

  @Put('category/:id')
  async updateProfileCategory(
    @Param('id') id: string,
    @Body() category: string,
  ): Promise<Profile> {
    return this.profileService.updateProfileCategory(id, category);
  }
}
