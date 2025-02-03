import { Controller, Post, Delete, Get, Param, Req, UseGuards, Body, Patch, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventService } from '../services/event.service';
import { CreateEventDto, UpdateEventDto } from '../../core/dto/event.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async getLatestEvents() {
    return this.eventService.findLatest(10);
  }

  @Get('category/:category')
  async getEventsByCategory(@Param('category') category: string) {
    return this.eventService.findByCategory(category, 0, 20);
  }

  @Get(':id')
  async getEventById(@Param('id') id: string) {
    const event = await this.eventService.getEventById(id);
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  @Post()
  @UseGuards(AuthGuard())
  async createEvent(@Body() eventData: CreateEventDto, @Req() req: any) {
    return this.eventService.createEvent({
      ...eventData,
      creatorId: req.user.id
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  async updateEvent(
    @Param('id') id: string,
    @Body() eventData: UpdateEventDto,
    @Req() req: any
  ) {
    const event = await this.eventService.getEventById(id);
    if (!event) throw new NotFoundException('Event not found');
    if (event.creatorId !== req.user.id) throw new ForbiddenException('Not authorized');
    
    return this.eventService.updateEvent(id, eventData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteEvent(@Param('id') id: string, @Req() req: any) {
    const event = await this.eventService.getEventById(id);
    if (!event) throw new NotFoundException('Event not found');
    if (event.creatorId !== req.user.id) throw new ForbiddenException('Not authorized');
    
    return this.eventService.deleteEvent(id);
  }

  @Post(':id/like')
  @UseGuards(AuthGuard())
  async likeEvent(@Param('id') eventId: string, @Req() req: any) {
    return this.eventService.likeEvent(eventId, req.user.id);
  }

  @Delete(':id/like')
  @UseGuards(AuthGuard())
  async unlikeEvent(@Param('id') eventId: string, @Req() req: any) {
    return this.eventService.unlikeEvent(eventId, req.user.id);
  }

  @Get('liked/:userId')
  @UseGuards(AuthGuard())
  async getLikedEvents(@Param('userId') userId: string) {
    return this.eventService.getLikedEvents(userId);
  }

  @Get(':id/isLiked')
  @UseGuards(AuthGuard())
  async isEventLiked(@Param('id') eventId: string, @Req() req: any) {
    return this.eventService.isLikedByUser(eventId, req.user.id);
  }

  @Get('location/:locationId')
  async getEventsByLocation(@Param('locationId') locationId: string) {
    return this.eventService.getEventsByLocation(locationId);
  }

  @Get('artist/:artistId')
  async getEventsByArtist(@Param('artistId') artistId: string) {
    return this.eventService.getEventsByArtist(artistId);
  }

  @Get('location/:locationId/upcoming')
  async getUpcomingEvents(@Param('locationId') locationId: string) {
    return this.eventService.getUpcomingEvents(locationId);
  }
} 