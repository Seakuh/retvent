import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProfileService } from 'src/application/services/profile.service';
import { Profile, UserPreferences } from 'src/core/domain/profile';
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

  @Get(':slug')
  async getProfile(@Param('slug') slug: string): Promise<Profile> {
    console.log('getProfile', slug);

    const isObjectId = /^[a-f\d]{24}$/i.test(slug); // z. B. MongoDB ID

    return isObjectId
      ? this.profileService.getProfileById(slug)
      : this.profileService.getProfileByUsername(slug);
  }

  @Get()
  async getAllProfiles(
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ): Promise<Profile[]> {
    console.log('getAllProfiles', limit, offset);
    return this.profileService.getAllProfiles(limit, offset);
  }

  // @Post('new-artist')
  // async createNewArtist(
  //   @UploadedFile() image: Express.Multer.File,
  //   @Body() createArtistDto: CreateArtistDto,
  // ): Promise<Profile> {
  //   return this.profileService.createNewArtist(
  //     image,
  //     createArtistDto,
  //   );
  // }

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

  @Put('preferences/:id')
  @UseGuards(JwtAuthGuard, ProfileOwnerGuard)
  async setProfilePreferences(
    @Param('id') id: string,
    @Body() preferences: UserPreferences,
  ): Promise<Profile> {
    return this.profileService.setProfilePreferences(id, preferences);
  }

  @Get('preferences/:id')
  async getProfilePreferences(
    @Param('id') id: string,
  ): Promise<UserPreferences> {
    return this.profileService.getProfilePreferences(id);
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

  @Put('gallery/:id')
  @UseGuards(JwtAuthGuard, ProfileOwnerGuard)
  @UseInterceptors(FilesInterceptor('gallery', 10))
  async updateProfileGallery(
    @Param('id') id: string,
    @UploadedFiles() gallery: Express.Multer.File[],
  ): Promise<Profile> {
    return this.profileService.updateProfileGallery(id, gallery);
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
