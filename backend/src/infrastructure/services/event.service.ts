import * as Tesseract from 'tesseract.js';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../../core/domain/event';
import { Multer } from 'multer';
import { ChatGPTService } from './chatgpt.service';
import { ImageService } from './image.service';
import { EventRepository } from '../repositories/event.repository';
import { GeolocationService } from './geolocation.service';

@Injectable()
export class EventService {



  constructor(
    @InjectModel('Event') private eventModel: Model<Event>,
    private readonly chatGptService: ChatGPTService,
    private readonly imageService: ImageService,
    private readonly eventRepository: EventRepository,
    private readonly geolocationService: GeolocationService,
  ) { }
  async processEventImage(imageUrl: string, lat?: number, lon?: number) {
    console.info('Processing event image:', imageUrl, lat, lon);
    const uploadedImageUrl = await this.imageService.uploadImage(imageUrl);
    const extractedText = await this.chatGptService.extractTextFromImage(uploadedImageUrl);
    const event = await this.chatGptService.generateEventFromText(extractedText);
    const createdEvent = await this.eventModel.create({ ...event, lat, lon, imageUrl: uploadedImageUrl });
    return createdEvent;
  }
  async processEventImageUpload(image: Multer.File, uploadLat?: number, uploadLon?: number) {
    // 1. Bild auf dem Image-Server hochladen
    console.info('Processing event image upload...');
    const uploadedImageUrl = await this.imageService.uploadImage(image);

    // 2. Bild durch ChatGPT analysieren, um Event-Daten zu erhalten
    console.info("Extract Object from Image...");
    // const extractedText = await this.chatGptService.extractTextFromImage(uploadedImageUrl);
    const event = await this.chatGptService.extractEventFromFlyer(uploadedImageUrl);

    // 3. lat/lon des Uploads per Geolocation-Service ermitteln (falls Location vorhanden ist)
    const uploadLocation = event.location?.trim()
      ? await this.geolocationService.getCoordinates(event.location)
      : null;

    const eventLat = uploadLocation && uploadLocation.lat ? uploadLocation.lat : uploadLat;
    const eventLon = uploadLocation && uploadLocation.lon ? uploadLocation.lon : uploadLon;



    // 4. Event mit Bild-URL in MongoDB speichern
    console.info("Save Event in MongoDB...");
    const createdEvent = await this.eventModel.create({
      ...event,
      uploadLat,
      uploadLon,
      eventLat: eventLat,
      eventLon: eventLon,
      imageUrl: uploadedImageUrl,
      geoLocation: {
        type: 'Point',
        coordinates: [eventLon, eventLat], // MongoDB benötigt [lon, lat]
      },
    });
    return createdEvent;
  }


  findNearbyEvents(latNum: number, lonNum: number, distanceNum: number) {
      return this.eventRepository.findNearbyEvents(latNum, lonNum, distanceNum);
    }


  // async extractTextFromImage(imageUrl: string): Promise<string> {
  //   console.info('Extracting text from image:', imageUrl);

  //   try {
  //     const { data } = await Tesseract.recognize(imageUrl, 'eng', {
  //       logger: (m) => console.log(m), // Zeigt Fortschritt an
  //     });

  //     console.info('Extracted text:', data.text);
  //     return data.text;
  //   } catch (error) {
  //     console.error('Error extracting text from image:', error);
  //     throw new Error('Text extraction failed');
  //   }
  // }


  async searchEvents(params: { query: string; location?: string }) {
    const filter: any = { name: new RegExp(params.query, 'i') };
    if (params.location) filter.location = new RegExp(params.location, 'i');
    return this.eventModel.find(filter);
  }

  async getEventById(id: string) {
    return this.eventModel.findById(id);
  }

  async getEventsByIds(ids: string[]) {
    return this.eventModel.find({ _id: { $in: ids } });
  }

  /**
  * Holt die neuesten 30 Events aus der Datenbank.
  */
  async getLatestEvents(): Promise<Event[]> {
    return this.eventRepository.findLatestEvents();
  }

}