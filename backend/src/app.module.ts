// src/app.module.ts
import { Module } from '@nestjs/common';
import { EventController } from './presentation/controllers/event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from './core/domain/event.schema';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import * as dotenv from 'dotenv';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { UserSchema } from './domain/schemas/user.schema';
import { MongoUserRepository } from './infrastructure/repositories/mongodb/user.repository';
import { MongoEventRepository } from './infrastructure/repositories/mongodb/event.repository';
import { PassportModule } from '@nestjs/passport';


dotenv.config(); // Lädt die .env-Datei


@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/eventscanner'), // Nutzt die MongoDB-URL aus .env
    MongooseModule.forFeature([
      { name: 'Event', schema: EventSchema },
      { name: 'User', schema: UserSchema }
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    InfrastructureModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [EventController, AuthController],
  providers: [
    AuthService,
    {
      provide: 'UserRepository',
      useClass: MongoUserRepository
    },
    {
      provide: 'IEventRepository',
      useClass: MongoEventRepository
    }
  ]
})
export class AppModule {}