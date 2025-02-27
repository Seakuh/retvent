import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { GrooveCast } from "src/core/domain/GrooveCast";
import { GroovecastService } from "src/infrastructure/services/groovecast.service";
import { CreateGrooveCastDto } from "../dtos/create-groove-cast.dto";
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('groovecast')
export class GroovecastController {
  constructor(private readonly groovecastService: GroovecastService) { }

  @Get()
  async findAll(): Promise<GrooveCast[]> {
    return this.groovecastService.findAll();
  }

  @Get(':season')
  async findBySeason(@Param('season') season: string): Promise<GrooveCast[]> {
    return this.groovecastService.findBySeason(season);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() image: Express.Multer.File,
    @Body() groovecast: CreateGrooveCastDto
  ): Promise<GrooveCast> {
    return this.groovecastService.create(groovecast, image);
  }
}