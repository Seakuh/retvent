import { Injectable } from '@nestjs/common';
import FormData from 'form-data';
import fetch from 'node-fetch';

@Injectable()
export class ImageService {
  async uploadImage(imagePath: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', imagePath);
    formData.append('folder', 'event-scanner/user/uploads');

    const response = await fetch('https://images.vartakt.com/images/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return `https://images.vartakt.com${data.url}`;
  }
}