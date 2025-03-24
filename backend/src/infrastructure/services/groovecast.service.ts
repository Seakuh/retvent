import { Injectable } from '@nestjs/common';
import { GrooveCast } from 'src/core/domain/GrooveCast';
import { CreateGrooveCastDto } from 'src/presentation/dtos/create-groove-cast.dto';
import { MongoGrooveCastRepository } from '../repositories/mongodb/groovecast.repository';
import { ImageService } from './image.service';

@Injectable()
export class GroovecastService {
  constructor(
    private readonly groovecastRepository: MongoGrooveCastRepository,
    private readonly imageService: ImageService,
  ) {}

  async findAll(): Promise<GrooveCast[]> {
    return this.groovecastRepository.findAll();
  }

  async findBySeason(season: string): Promise<GrooveCast[]> {
    return this.groovecastRepository.findBySeason(season);
  }

  async create(
    dto: CreateGrooveCastDto,
    image: Express.Multer.File,
  ): Promise<GrooveCast> {
    try {
      const imageUrl = await this.imageService.uploadImage(image);

      const grooveCast: GrooveCast = {
        soundcloudUrl: dto.soundcloudUrl,
        season: dto.season,
        imageUrl,
      };

      return this.groovecastRepository.create(grooveCast);
    } catch (error) {
      throw new Error('Failed to create groovecast');
    }
  }
}
