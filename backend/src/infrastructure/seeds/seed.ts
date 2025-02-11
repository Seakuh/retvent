import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { testEvents } from './events.seed';
import { testLocations } from './locations.seed';
import { IEventRepository } from '../../core/repositories/event.repository.interface';
import { ILocationRepository } from '../../core/repositories/location.repository.interface';

async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    
    console.log('Getting repositories...');
    const locationRepo = app.get<ILocationRepository>('ILocationRepository');
    const eventRepo = app.get<IEventRepository>('IEventRepository');

    // Locations seeden
    console.log('Seeding locations...');
    for (const locationData of testLocations) {
      try {
        const location = await locationRepo.create(locationData);
        console.log(`Created location: ${location.name}`);
      } catch (error) {
        console.error(`Error creating location ${locationData.name}:`, error);
      }
    }

    // Events seeden
    console.log('Seeding events...');
    for (const eventData of testEvents) {
      try {
        const event = await eventRepo.create(eventData);
        console.log(`Created event: ${event.title}`);
      } catch (error) {
        console.error(`Error creating event ${eventData.title}:`, error);
      }
    }

    await app.close();
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

bootstrap(); 