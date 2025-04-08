import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { CommentService } from 'src/application/services/comment.service';
import { EventEmbeddingService } from 'src/application/services/eventembedding.service';
import { GroupService } from 'src/application/services/group.service';
import { ProfileService } from 'src/application/services/profile.service';
import { CommentController } from 'src/presentation/controllers/comment.controller';
import { GroovecastController } from 'src/presentation/controllers/groovecast.controller';
import { SearchController } from 'src/presentation/controllers/search.controller';
import { UserController } from 'src/presentation/controllers/user.controller';
import { EventMapper } from '../application/mappers/event.mapper';
import { EventService } from '../application/services/event.service';
import { LocationService } from '../application/services/location.service';
import { UserService } from '../application/services/user.service';
import { CoreModule } from '../core/core.module';
import { BcryptService } from '../core/services/bcrypt.service';
import { AuthController } from '../presentation/controllers/auth.controller';
import { EventController } from '../presentation/controllers/event.controller';
import { GroupController } from '../presentation/controllers/group.controller';
import { LocationController } from '../presentation/controllers/location.controller';
import { JwtAuthGuard } from '../presentation/guards/jwt-auth.guard';
import { OwnerGuard } from '../presentation/guards/owner.guard';
import { AuthModule } from './modules/auth.module';
import { MongoCommentRepository } from './repositories/mongodb/comment.repository';
import { MongoEventRepository } from './repositories/mongodb/event.repository';
import { MongoGrooveCastRepository } from './repositories/mongodb/groovecast.repository';
import { MongoGroupRepository } from './repositories/mongodb/group.repository';
import { MongoLocationRepository } from './repositories/mongodb/location.repository';
import { MongoProfileRepository } from './repositories/mongodb/profile.repository';
import { MongoUserRepository } from './repositories/mongodb/user.repository';
import { CommentSchema } from './schemas/comment.schema';
import { EventSchema } from './schemas/event.schema';
import { GroovecastSchema } from './schemas/groovecast.schema';
import { GroupSchema } from './schemas/group.schmema';
import { LocationSchema } from './schemas/location.schema';
import { ProfileSchema } from './schemas/profile.schema';
import { UserSchema } from './schemas/user.schema';
import { AuthService } from './services/auth.service';
import { ChatGPTService } from './services/chatgpt.service';
import { GeolocationService } from './services/geolocation.service';
import { GroovecastService } from './services/groovecast.service';
import { ImageService } from './services/image.service';
import { JwtStrategy } from './strategies/jwt.strategy';
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
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '30d' },
    }),
    MongooseModule.forFeature([
      { name: 'Event', schema: EventSchema },
      { name: 'Location', schema: LocationSchema },
      { name: 'User', schema: UserSchema },
      { name: 'GrooveCast', schema: GroovecastSchema },
      { name: 'Comment', schema: CommentSchema },
      { name: 'Profile', schema: ProfileSchema },
      { name: 'Group', schema: GroupSchema },
    ]),
  ],
  controllers: [
    AuthController,
    LocationController,
    EventController,
    GroovecastController,
    CommentController,
    UserController,
    SearchController,
    GroupController,
  ],
  providers: [
    EventService,
    ProfileService,
    CommentService,
    GroupService,
    ChatGPTService,
    EventEmbeddingService,
    ImageService,
    GeolocationService,
    LocationService,
    AuthService,
    MongoEventRepository,
    MongoGroupRepository,
    MongoLocationRepository,
    MongoUserRepository,
    MongoGrooveCastRepository,
    MongoCommentRepository,
    MongoProfileRepository,
    JwtStrategy,
    JwtAuthGuard,
    OwnerGuard,
    EventMapper,
    ConfigService,
    BcryptService,
    UserService,
    GroovecastService,
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
    {
      provide: 'ICommentRepository',
      useClass: MongoCommentRepository,
    },
    {
      provide: 'IProfileRepository',
      useClass: MongoProfileRepository,
    },
    {
      provide: 'IGroupRepository',
      useClass: MongoGroupRepository,
    },
  ],
  exports: [
    EventService,
    EventEmbeddingService,
    ChatGPTService,
    LocationService,
    AuthService,
    GroupService,
    ImageService,
    JwtAuthGuard,
    OwnerGuard,
    'IEventRepository',
    'ILocationRepository',
    'IUserRepository',
    'ICommentRepository',
    'IProfileRepository',
    'IGroupRepository',
    JwtModule,
    MongoEventRepository,
    MongoProfileRepository,
    MongoLocationRepository,
    MongoGrooveCastRepository,
    MongoCommentRepository,
    EventMapper,
    AuthModule,
    GeolocationService,
    ConfigService,
    GroovecastService,
    BcryptService,
    UserService,
    CommentService,
    ProfileService,
  ],
})
export class InfrastructureModule {}
