import { Controller, Post, Body, Get, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { EventService } from 'src/infrastructure/services/event.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('events')
export class EventController {
  constructor(
    // private readonly meetupService: MeetupService,
    private readonly eventService: EventService
  ) { }

  @Get('search/plattforms')
  async searchEventPlattforms(@Query('query') query: string, @Query('location') location?: string): Promise<any> {
    const params = { query, location };
    console.info('Searching for events with params:', params);
    // const meetupEvents = await this.meetupService.searchEvents(params);
    // const chatGPTEvents = await this.chatGPTService.searchEvents(params);
    // return [...meetupEvents, ...chatGPTEvents];
    // return [...meetupEvents];

  }

  @Post('upload/event-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadEventImage(
    @UploadedFile() image: Multer.File,
    @Body() body: { uploadLat?: number; uploadLon?: number },
  ) {
    return this.eventService.processEventImageUpload(image, body.uploadLat, body.uploadLon);
  }


  @Post('upload')
  async uploadEvent(@Body() body: { imageUrl: string; lat?: number; lon?: number }) {
    return this.eventService.processEventImage(body.imageUrl, body.lat, body.lon);
  }

  @Get('search')
  async searchEvents(@Query('query') query: string, @Query('location') location?: string) {
    return this.eventService.searchEvents({ query, location });
  }

  @Get('byId')
  async getEventById(@Query('id') id: string) {
    return this.eventService.getEventById(id);
  }

  @Get('byIds')
  async getEventsByIds(@Query('ids') ids: string) {
    return this.eventService.getEventsByIds(ids.split(','));
  }

  /**
 * Gibt die neuesten 30 Events zurück, sortiert nach Erstellungsdatum.
 */
  @Get('latest')
  async getLatestEvents() {
    return this.eventService.getLatestEvents();
  }


  @Get('nearby')
  async getNearbyEvents(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('maxDistance') maxDistance: string
  ) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const distanceNum = parseFloat(maxDistance) || 10;

    if (isNaN(latNum) || isNaN(lonNum)) {
      return { error: 'Invalid coordinates' };
    }
    
    return this.eventService.findNearbyEvents(latNum, lonNum, distanceNum);
  }


}