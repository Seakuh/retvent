import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { CreateOrganiserDto } from "../dtos/create-organiser.dto";
import { OrganiserService } from "src/infrastructure/services/organiser.service";

@Controller('organisers')
export class OrganiserController {
    constructor(private readonly organiserService: OrganiserService) {}

    @Post()
    async createOrganiser(@Body() createOrganiserDto: CreateOrganiserDto) {
        return this.organiserService.createOrganiser(createOrganiserDto);
    }

    @Get()
    async getOrganisersByHost(@Query('host') host: string) {
        return this.organiserService.findByHost(host);
    }

    @Put(':id')
    async updateOrganiser(@Param('id') id: string, @Body() updateOrganiserDto: CreateOrganiserDto) {
        return this.organiserService.updateOrganiser(id, updateOrganiserDto);
    }
}