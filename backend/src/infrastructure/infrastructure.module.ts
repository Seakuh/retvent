import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { EventService } from './services/event.service';
import { ChatGPTService } from './services/chatgpt.service';
import { ImageService } from './services/image.service';
import { GeolocationService } from './services/geolocation.service';
import { EventSchema } from './schemas/event.schema';
import { MongoEventRepository } from './repositories/mongodb/event.repository';
import { LocationSchema } from './schemas/location.schema';
import { UserSchema } from './schemas/user.schema';
import { LocationService } from './services/location.service';
import { MongoLocationRepository } from './repositories/mongodb/location.repository';
import { MongoUserRepository } from './repositories/mongodb/user.repository';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: 'Event', schema: EventSchema },
      { name: 'Location', schema: LocationSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [
    EventService,
    ChatGPTService,
    ImageService,
    GeolocationService,
    LocationService,
    {
      provide: 'IEventRepository',
      useClass: MongoEventRepository,
    },
    {
      provide: 'ILocationRepository',
      useClass: MongoLocationRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepository,
    },
  ],
  exports: [
    EventService,
    LocationService,
    GeolocationService,
    'IEventRepository',
    'ILocationRepository',
    'IUserRepository',
  ],
})
export class InfrastructureModule {}
