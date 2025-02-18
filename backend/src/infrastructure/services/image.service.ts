import * as FormData from 'form-data';
import fetch from 'node-fetch';
import { Injectable } from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class ImageService {
  async uploadImage(image: Express.Multer.File): Promise<string> {
    if (process.env.NODE_ENV === 'test') {
      return 'https://images.vartakt.com/images/groovecast_season_II/f1f068d6-4412-4d66-bc39-7c8cc661f575.png?width=2000&height=2000&quality=100';
    }

    const formData = new FormData();
    formData.append('file', image.buffer, { filename: image.originalname });
    formData.append('folder', 'event-scanner/user/uploads');

    const response = await fetch('https://images.vartakt.com/images/upload', {
      method: 'POST',
      body: formData as any, // TypeScript Fix
      headers: formData.getHeaders(), // WICHTIG: Headers setzen
    });

    if (!response.ok) {
      throw new Error(`Image upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return `https://images.vartakt.com${data.url}`;
  }

  // async uploadImagToBucket(image: Express.Multer.File): Promise<string> {
    

}
