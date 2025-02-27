import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth.module';
import { CoreModule } from '../core/core.module';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { EventService } from '../application/services/event.service';
import { ChatGPTService } from './services/chatgpt.service';
import { ImageService } from './services/image.service';
import { GeolocationService } from './services/geolocation.service';
import { EventSchema } from './schemas/event.schema';
import { LocationSchema } from './schemas/location.schema';
import { UserSchema } from './schemas/user.schema';
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
import { EventMapper } from '../application/mappers/event.mapper';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GroovecastController } from 'src/presentation/controllers/groovecast.controller';
import { GroovecastService } from './services/groovecast.service';
import { MongoGrooveCastRepository } from './repositories/mongodb/groovecast.repository';
import { GroovecastSchema } from './schemas/groovecast.schema';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    MongooseModule.forFeature([
      { name: 'Event', schema: EventSchema },
      { name: 'Location', schema: LocationSchema },
      { name: 'User', schema: UserSchema },
      { name: 'GrooveCast', schema: GroovecastSchema }
    ])
  ],
  controllers: [
    AuthController,
    LocationController,
    EventController,
    GroovecastController
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
    MongoGrooveCastRepository,
    JwtStrategy,
    JwtAuthGuard,
    OwnerGuard,
    EventMapper,
    ConfigService,
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
    },
    GroovecastService
  ],
  exports: [
    EventService,
    LocationService,
    AuthService,
    ImageService,
    JwtAuthGuard,
    OwnerGuard,
    'IEventRepository',
    'ILocationRepository',
    'IUserRepository',
    JwtModule,
    MongoEventRepository,
    MongoLocationRepository,
    MongoGrooveCastRepository,
    EventMapper,
    AuthModule,
    GeolocationService,
    ConfigService,
    GroovecastService
  ],
})
export class InfrastructureModule {}
