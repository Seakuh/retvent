// import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../../app.module';
// import { testEvents } from './events.seed';
// import { testLocations } from './locations.seed';
// import { IEventRepository } from '../../core/repositories/event.repository.interface';
// import { ILocationRepository } from '../../core/repositories/location.repository.interface';
// import { Event } from '../../core/entities/event.entity';

// async function bootstrap() {
//   try {
//     const app = await NestFactory.createApplicationContext(AppModule);

//     console.log('Getting repositories...');
//     const locationRepo = app.get<ILocationRepository>('ILocationRepository');
//     const eventRepo = app.get<IEventRepository>('IEventRepository');

//     // Locations seeden
//     console.log('Seeding locations...');
//     for (const locationData of testLocations) {
//       try {
//         const location = await locationRepo.create(locationData);
//         // console.log(`Created location: ${location.name}`);
//       } catch (error) {
//         console.error(`Error creating location ${locationData.name}:`, error);
//       }
//     }

//     // Events seeden
//     console.log('Seeding events...');
//     for (const eventData of testEvents) {
//       try {
//         const event = await eventRepo.create(eventData);
//         console.log(`Created event: ${event.title}`);
//       } catch (error) {
//         console.error(`Error creating event ${eventData.title}:`, error);
//       }
//     }

//     // Event-Seed-Daten anpassen
//     const eventData: Partial<Event> = {
//       title: 'Summer Festival 2024',
//       description: 'Das größte Festival des Jahres',
//       category: 'festival',
//       startDate: new Date('2024-07-01'),
//       startTime: '16:00',
//       imageUrl: 'https://example.com/image.jpg',
//       hostId: 'seed-host-id',
//       locationId: 'seed-location-id',
//       price: 49.99,
//       tags: ['musik', 'sommer', 'festival'],
//       lineup: [
//         { name: 'DJ Cool', role: 'Headliner', startTime: '22:00' },
//         { name: 'Band XYZ', role: 'Support', startTime: '20:00' }
//       ],
//       socialMediaLinks: {
//         instagram: 'https://instagram.com/summerfest',
//         facebook: 'https://facebook.com/summerfest'
//       }
//     };

//     await app.close();
//     console.log('Seeding completed successfully!');
//   } catch (error) {
//     console.error('Error during seeding:', error);
//     process.exit(1);
//   }
// }

// bootstrap();
