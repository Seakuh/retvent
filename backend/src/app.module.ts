// src/app.module.ts
import { Module } from '@nestjs/common';
import { EventController } from './presentation/controllers/event.controller';
import { MeetupService } from './infrastructure/services/meetup.service';
import { ChatGPTService } from './infrastructure/services/chatgpt.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/eventscanner'),
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
  ],
  controllers: [EventController],
  providers: [MeetupService, ChatGPTService],
})
export class AppModule {}