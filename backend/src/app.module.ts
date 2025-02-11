// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EventController } from './presentation/controllers/event.controller';
import { LocationController } from './presentation/controllers/location.controller';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://gi:gi@ac-rlxgin6-shard-00-00.2qpgkpj.mongodb.net:27017,ac-rlxgin6-shard-00-01.2qpgkpj.mongodb.net:27017,ac-rlxgin6-shard-00-02.2qpgkpj.mongodb.net:27017/event?ssl=true&replicaSet=atlas-jk0nx1-shard-0&authSource=admin&retryWrites=true&w=majority';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(MONGODB_URI, {
      retryWrites: true,
      retryAttempts: 5,
      retryDelay: 1000,
    }),
    InfrastructureModule
  ],
  controllers: [EventController, LocationController]
})
export class AppModule {}