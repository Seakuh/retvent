import * as FormData from 'form-data';
import fetch from 'node-fetch';
import { Injectable } from '@nestjs/common';
import { Multer } from 'multer';

@Injectable()
export class ImageService {
  async uploadImage(image: Multer.File): Promise<string> {
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
}
