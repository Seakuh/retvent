import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { GrooveCast } from "src/core/domain/GrooveCast";
import { GroovecastService } from "src/infrastructure/services/groovecast.service";


@Controller('groovecast')
export class GroovecastController {
  constructor(private readonly groovecastService: GroovecastService) {}

  @Get()
  async findAll(): Promise<GrooveCast[]> {
    return this.groovecastService.findAll();
  }

  @Get(':season')
  async findBySeason(@Param('season') season: string): Promise<GrooveCast[]> {
    return this.groovecastService.findBySeason(season);
  }

  @Post()
  async create(@Body() groovecast: GrooveCast): Promise<GrooveCast> {
    return this.groovecastService.create(groovecast);
  }
}
