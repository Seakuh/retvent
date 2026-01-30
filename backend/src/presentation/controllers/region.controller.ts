import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { RegionService } from '../../application/services/region.service';
import { RegionSeoService, SEOContent } from '../../application/services/region-seo.service';
import { CreateRegionDto } from '../dtos/create-region.dto';
import { UpdateRegionDto } from '../dtos/update-region.dto';
import { VibeRatingDto } from '../dtos/vibe-rating.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('regions')
export class RegionController {
  constructor(
    private readonly regionService: RegionService,
    private readonly regionSeoService: RegionSeoService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async createRegion(
    @Body() createRegionDto: CreateRegionDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Trenne Logo und Images basierend auf Feldnamen
    let logo: Express.Multer.File | undefined;
    const images: Express.Multer.File[] = [];

    if (files && files.length > 0) {
      files.forEach((file) => {
        if (file.fieldname === 'logo') {
          logo = file;
        } else if (file.fieldname === 'images' || file.fieldname.startsWith('images')) {
          images.push(file);
        }
      });
    }
    
    return this.regionService.createRegion(createRegionDto, logo, images);
  }

  @Get()
  async getAllRegions() {
    return this.regionService.getAllRegions();
  }

  @Get('search')
  async searchRegions(@Query('q') query: string) {
    if (!query) {
      return this.regionService.getAllRegions();
    }
    return this.regionService.searchRegions(query);
  }

  @Get('nearby')
  async findRegionsNearby(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('radius') radius?: number,
  ) {
    if (!lat || !lon) {
      throw new Error('lat and lon query parameters are required');
    }
    return this.regionService.findRegionsNearby(
      parseFloat(lat.toString()),
      parseFloat(lon.toString()),
      radius ? parseFloat(radius.toString()) : 50,
    );
  }

  @Get(':id')
  async getRegionById(@Param('id') id: string) {
    return this.regionService.getRegionById(id);
  }

  @Get('slug/:slug')
  async getRegionBySlug(@Param('slug') slug: string) {
    return this.regionService.getRegionBySlug(slug);
  }

  @Get(':id/events')
  async getEventsInRegion(@Param('id') id: string) {
    return this.regionService.getEventsInRegion(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async updateRegion(
    @Param('id') id: string,
    @Body() updateRegionDto: UpdateRegionDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Trenne Logo und Images basierend auf Feldnamen
    let logo: Express.Multer.File | undefined;
    const images: Express.Multer.File[] = [];

    if (files && files.length > 0) {
      files.forEach((file) => {
        if (file.fieldname === 'logo') {
          logo = file;
        } else if (file.fieldname === 'images' || file.fieldname.startsWith('images')) {
          images.push(file);
        }
      });
    }
    
    return this.regionService.updateRegion(id, updateRegionDto, logo, images);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteRegion(@Param('id') id: string) {
    await this.regionService.deleteRegion(id);
    return { message: 'Region deleted successfully' };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async likeRegion(@Param('id') id: string, @Req() req: any) {
    return this.regionService.likeRegion(id, req.user.sub || req.user.id);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  async unlikeRegion(@Param('id') id: string, @Req() req: any) {
    return this.regionService.unlikeRegion(id, req.user.sub || req.user.id);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async followRegion(@Param('id') id: string, @Req() req: any) {
    return this.regionService.followRegion(id, req.user.sub || req.user.id);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  async unfollowRegion(@Param('id') id: string, @Req() req: any) {
    return this.regionService.unfollowRegion(id, req.user.sub || req.user.id);
  }

  @Post(':id/share')
  async shareRegion(@Param('id') id: string) {
    return this.regionService.shareRegion(id);
  }

  @Post(':id/vibe')
  @UseGuards(JwtAuthGuard)
  async rateVibe(
    @Param('id') id: string,
    @Body() vibeRating: VibeRatingDto,
    @Req() req: any,
  ) {
    await this.regionService.rateVibe(
      id,
      req.user.sub || req.user.id,
      vibeRating,
    );
    return { message: 'Vibe rating saved successfully' };
  }

  @Get(':id/vibe')
  async getVibeAverage(@Param('id') id: string) {
    return this.regionService.getVibeAverage(id);
  }

  @Post(':id/events/:eventId')
  @UseGuards(JwtAuthGuard)
  async addEventToRegion(
    @Param('id') id: string,
    @Param('eventId') eventId: string,
  ) {
    return this.regionService.addEventToRegion(id, eventId);
  }

  @Delete(':id/events/:eventId')
  @UseGuards(JwtAuthGuard)
  async removeEventFromRegion(
    @Param('id') id: string,
    @Param('eventId') eventId: string,
  ) {
    return this.regionService.removeEventFromRegion(id, eventId);
  }

  @Post(':id/generate-seo')
  @UseGuards(JwtAuthGuard)
  async generateSeoContent(
    @Param('id') id: string,
    @Body() options?: {
      regionPlaces?: string[];
      topEventCategories?: string[];
      nearbyRegions?: string[];
    },
  ): Promise<SEOContent> {
    return this.regionSeoService.generateSeoContent(id, options);
  }
}
