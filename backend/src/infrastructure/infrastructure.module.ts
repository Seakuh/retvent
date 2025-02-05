import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { EventService } from '../application/services/event.service';
import { ChatGPTService } from './services/chatgpt.service';
import { ImageService } from './services/image.service';
import { GeolocationService } from './services/geolocation.service';
import { EventSchema, LocationSchema, UserSchema } from '../core/domain';
import { MongoEventRepository } from './repositories/mongodb/event.repository';
import { LocationService } from '../application/services/location.service';
import { AuthService } from './services/auth.service';
import { AuthController } from '../presentation/controllers/auth.controller';
import { LocationController } from '../presentation/controllers/location.controller';
import { EventController } from '../presentation/controllers/event.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.strategy';
import { MongoLocationRepository } from './repositories/mongodb/location.repository';
import { MongoUserRepository } from './repositories/mongodb/user.repository';
import { JwtAuthGuard } from '../presentation/guards/jwt-auth.guard';
import { OwnerGuard } from '../presentation/guards/owner.guard';

@Module({
  imports: [
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    MongooseModule.forFeature([
      { name: 'Event', schema: EventSchema },
      { name: 'Location', schema: LocationSchema },
      { name: 'User', schema: UserSchema }
    ])
  ],
  controllers: [
    AuthController,
    LocationController,
    EventController
  ],
  providers: [
    EventService,
    ChatGPTService,
    ImageService,
    GeolocationService,
    LocationService,
    AuthService,
    MongoEventRepository,
    MongoLocationRepository,
    MongoUserRepository,
    JwtStrategy,
    JwtAuthGuard,
    OwnerGuard,
    {
      provide: 'IEventRepository',
      useClass: MongoEventRepository
    },
    {
      provide: 'ILocationRepository',
      useClass: MongoLocationRepository
    },
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepository,
    }
  ],
  exports: [
    EventService,
    LocationService,
    AuthService,
    JwtAuthGuard,
    OwnerGuard,
    'IEventRepository',
    'ILocationRepository',
    'IUserRepository',
    JwtModule,
    MongoEventRepository,
    MongoLocationRepository
  ],
})
export class InfrastructureModule {}
