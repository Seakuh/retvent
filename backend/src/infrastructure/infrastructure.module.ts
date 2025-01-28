import { Module } from '@nestjs/common';
import { EventService } from './services/event.service';
import { ImageService } from './services/image.service';
import { ChatGPTService } from './services/chatgpt.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from 'src/core/domain/event.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]), // Hier wird EventModel hinzugefügt
      ],
  providers: [EventService, ChatGPTService, ImageService],
  exports: [EventService, ChatGPTService, ImageService], // Exporte, damit andere Module sie nutzen können
})
export class InfrastructureModule {}
