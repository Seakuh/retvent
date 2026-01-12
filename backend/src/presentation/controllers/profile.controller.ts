import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProfileService } from 'src/application/services/profile.service';
import { Profile, UserPreferences } from 'src/core/domain/profile';
import { ImageService } from 'src/infrastructure/services/image.service';
import { DocumentService } from 'src/infrastructure/services/document.service';
import { UpdateUserProfileDto } from '../dtos/update-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProfileOwnerGuard } from '../guards/profile-owner.guard';
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly imageService: ImageService,
    private readonly documentService: DocumentService,
  ) {}

  @Get(':slug')
  async getProfile(@Param('slug') slug: string): Promise<Profile> {
    console.log('getProfile', slug);

    const isObjectId = /^[a-f\d]{24}$/i.test(slug); // z. B. MongoDB ID

    return isObjectId
      ? this.profileService.getProfileById(slug)
      : this.profileService.getProfileByUsername(slug);
  }


  @Get('page/:slug')
  async getProfilePage(@Param('slug') slug: string): Promise<Profile> {
    const isObjectId = /^[a-f\d]{24}$/i.test(slug); // z. B. MongoDB ID

    return isObjectId
      ? this.profileService.getProfilePageById(slug)
      : this.profileService.getProfilePageByUsername(slug);
  }

  @Get()
  async getAllProfiles(
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ): Promise<Profile[]> {
    console.log('getAllProfiles', limit, offset);
    return this.profileService.getAllProfiles(limit, offset);
  }

  @Get('search')
  async searchProfiles(@Query('query') query: string): Promise<Profile[]> {
    return this.profileService.searchProfiles(query);
  }


  // ------------------------------------------------------------
  // Poker Onboarding
  // ------------------------------------------------------------
  @Get('poker/onboarding')
  async getPokerOnboarding(): Promise<any> {
    return this.profileService.getPokerOnboarding();
  }

  @Post('poker/onboarding')
  @UseGuards(JwtAuthGuard)
  async setPokerOnboarding(@Body() onboarding: any, @Req() req): Promise<any> {
    // If onboarding is empty (null, undefined, or an empty object), return "ok"
    if (
      !onboarding ||
      (typeof onboarding === 'object' &&
        Object.keys(onboarding).length === 0 &&
        onboarding.constructor === Object)
    ) {
      return 'ok';
    }
    return this.profileService.setPokerOnboarding(onboarding, req.user.sub);
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

  @Get("status/:userId")
  async getProfileStatus(@Param('userId') userId: string): Promise<any> {
    return this.profileService.getProfileStatus(userId);
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

  @Get('sponsored/latest')
  async getSponsoredProfiles(@Query('limit') limit: number = 10) {
    const profiles = await this.profileService.findSponsoredProfiles(limit);
    return { profiles };
  }

  @Get('search/:query')
  async searchProfilesByQuery(
    @Param('query') query: string,
  ): Promise<Profile[]> {
    return this.profileService.searchProfilesByQuery(query);
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

  // ------------------------------------------------------------
  // Share Profile
  // ------------------------------------------------------------
  @Post('share/profile')
  @UseGuards(JwtAuthGuard)
  async shareProfile(@Body() body: { profileId: string }, @Req() req) {
    return this.profileService.shareProfile(body.profileId, req.user.id);
  }

  /**
   * Fügt Dokumente zu einem Profil hinzu
   * POST /profile/:profileId/documents
   */
  @Post(':profileId/documents')
  @UseGuards(JwtAuthGuard, ProfileOwnerGuard)
  @UseInterceptors(FilesInterceptor('documents', 10))
  async addDocumentsToProfile(
    @Param('profileId') profileId: string,
    @UploadedFiles() documents: Express.Multer.File[],
    @Req() req,
  ) {
    if (!documents || documents.length === 0) {
      throw new BadRequestException('No documents provided');
    }

    return this.profileService.addDocumentsToProfile(
      profileId,
      documents,
      req.user.id,
    );
  }

  /**
   * Entfernt ein Dokument von einem Profil
   * DELETE /profile/:profileId/documents
   */
  @Delete(':profileId/documents')
  @UseGuards(JwtAuthGuard, ProfileOwnerGuard)
  async removeDocumentFromProfile(
    @Param('profileId') profileId: string,
    @Body() body: { documentUrl: string },
    @Req() req,
  ) {
    return this.profileService.removeDocumentFromProfile(
      profileId,
      body.documentUrl,
      req.user.id,
    );
  }
}
