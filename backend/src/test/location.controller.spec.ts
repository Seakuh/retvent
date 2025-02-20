// import { Test, TestingModule } from '@nestjs/testing';
// import { LocationController } from '../presentation/controllers/location.controller';
// import { LocationService } from '../infrastructure/services/location.service';
// import * as request from 'supertest';
// import { INestApplication } from '@nestjs/common';
// import { JwtAuthGuard } from '../presentation/guards/jwt-auth.guard';
// import { User } from '../core/domain/user';

// describe('LocationController', () => {
//   let app: INestApplication;
//   let locationService: LocationService;

//   const mockUser: Partial<User> = {
//     id: '1',
//     username: 'testuser',
//   };

//   // Mock für den JwtAuthGuard
//   const mockJwtGuard = {
//     canActivate: (context) => {
//       const req = context.switchToHttp().getRequest();
//       req.user = mockUser;
//       return true;
//     },
//   };

//   beforeEach(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       controllers: [LocationController],
//       providers: [
//         {
//           provide: LocationService,
//           useValue: {
//             createLocation: jest.fn().mockResolvedValue({
//               id: '1',
//               name: 'Test Location',
//               ownerId: mockUser.id,
//             }),
//             findNearbyLocations: jest.fn().mockResolvedValue([
//               {
//                 id: '1',
//                 name: 'Nearby Location',
//                 coordinates: { latitude: 52.520008, longitude: 13.404954 },
//               },
//             ]),
//             getLocationById: jest.fn().mockResolvedValue({
//               id: '1',
//               name: 'Test Location',
//             }),
//             followLocation: jest.fn().mockResolvedValue({
//               id: '1',
//               followerIds: [mockUser.id],
//             }),
//           },
//         },
//       ],
//     })
//       .overrideGuard(JwtAuthGuard)
//       .useValue(mockJwtGuard)
//       .compile();

//     app = moduleFixture.createNestApplication();
//     await app.init();
//     locationService = moduleFixture.get<LocationService>(LocationService);
//   });

//   afterAll(async () => {
//     await app.close();
//   });

//   describe('POST /locations', () => {
//     it('should create a new location', () => {
//       const createLocationDto = {
//         name: 'Test Location',
//         logoUrl: 'http://example.com/logo.png',
//         latitude: 52.520008,
//         longitude: 13.404954,
//         address: 'Test Address'
//       };

//       return request(app.getHttpServer())
//         .post('/locations')
//         .send(createLocationDto)
//         .expect(201)
//         .expect((response) => {
//           expect(response.body).toHaveProperty('id');
//           expect(response.body.name).toBe(createLocationDto.name);
//           expect(response.body.ownerId).toBe(mockUser.id);
//         });
//     });
//   });

//   describe('GET /locations/nearby', () => {
//     it('should return nearby locations', () => {
//       return request(app.getHttpServer())
//         .get('/locations/nearby')
//         .query({ lat: 52.520008, lon: 13.404954, maxDistance: 10 })
//         .expect(200)
//         .expect((response) => {
//           expect(Array.isArray(response.body)).toBe(true);
//           expect(response.body[0]).toHaveProperty('id');
//           expect(response.body[0]).toHaveProperty('name');
//         });
//     });
//   });

//   describe('POST /locations/:id/follow', () => {
//     it('should follow a location', () => {
//       return request(app.getHttpServer())
//         .post('/locations/1/follow')
//         .expect(200)
//         .expect((response) => {
//           expect(response.body).toHaveProperty('followerIds');
//           expect(response.body.followerIds).toContain(mockUser.id);
//         });
//     });
//   });
// }); 