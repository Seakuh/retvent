import { Module } from '@nestjs/common';
import { EventService } from './services/event.service';
import { ImageService } from './services/image.service';
import { ChatGPTService } from './services/chatgpt.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from 'src/core/domain/event.schema';
import { EventRepository } from './repositories/event.repository';
import { GeolocationService } from './services/geolocation.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]), HttpModule],
  providers: [GeolocationService, EventService, ChatGPTService, ImageService,EventRepository], // Hier werden die Services hinzugefügt
  exports: [EventService, ChatGPTService, ImageService, GeolocationService], // Exporte, damit andere Module sie nutzen können
})
export class InfrastructureModule { }
