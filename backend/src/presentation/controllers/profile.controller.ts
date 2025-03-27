import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProfileService } from 'src/application/services/profile.service';
import { Profile } from 'src/core/domain/profile';
import { ImageService } from 'src/infrastructure/services/image.service';
import { UpdateUserProfileDto } from '../dtos/update-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProfileOwnerGuard } from '../guards/profile-owner.guard';
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly imageService: ImageService,
  ) {}

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

  @UseGuards(JwtAuthGuard, ProfileOwnerGuard)
  @Put('profile-picture/:id')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Profile> {
    return this.profileService.updateProfilePicture(id, file);
  }

  @Put('header-picture/:id')
  @UseGuards(JwtAuthGuard, ProfileOwnerGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateHeaderPicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Profile> {
    return this.profileService.updateHeaderPicture(id, file);
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

  @Put(':id/update')
  @UseGuards(ProfileOwnerGuard)
  @UseInterceptors(
    FileInterceptor('headerImage'),
    FileInterceptor('profileImage'),
    FilesInterceptor('gallery', 10),
  )
  async updateProfileComplete(
    @Param('id') id: string,
    @Body() updateData: UpdateUserProfileDto,
    @UploadedFile() headerImage?: Express.Multer.File,
    @UploadedFile() profileImage?: Express.Multer.File,
    @UploadedFiles() gallery?: Express.Multer.File[],
  ): Promise<Profile> {
    // Basis-Update-Objekt mit den regulären Feldern
    const updateObject: Partial<Profile> = {
      ...updateData,
    };

    // Bilder verarbeiten, falls vorhanden
    if (headerImage) {
      updateObject.headerImageUrl =
        await this.imageService.uploadImage(headerImage);
    }

    if (profileImage) {
      updateObject.profileImageUrl =
        await this.imageService.uploadImage(profileImage);
    }

    if (gallery?.length) {
      updateObject.gallery = await Promise.all(
        gallery.map((file) => this.imageService.uploadImage(file)),
      );
    }

    return this.profileService.updateProfile(id, updateObject as Profile);
  }
}
