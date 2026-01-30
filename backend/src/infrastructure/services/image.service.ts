import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

@Injectable()
export class ImageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    const accessKey = this.configService.get<string>('HETZNER_ACCESS_KEY');
    const secretKey = this.configService.get<string>('HETZNER_SECRET_KEY');
    this.bucketName =
      this.configService.get<string>('HETZNER_BUCKET_NAME') || 'imagebucket';

    if (!accessKey || !secretKey) {
      console.error('Missing Hetzner credentials');
    }

    this.s3Client = new S3Client({
      region: 'eu-central-1',
      endpoint: 'https://hel1.your-objectstorage.com',
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadImageFromBuffer(
    imageBuffer: Buffer,
    contentType: string = 'image/jpeg',
    originalFilename?: string,
  ): Promise<string> {
    try {
      // Bestimme Dateiendung aus Content-Type oder Original-Dateiname
      let fileExtension = 'jpg';
      
      if (originalFilename) {
        const ext = originalFilename.split('.').pop()?.toLowerCase();
        if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
          fileExtension = ext;
        }
      } else if (contentType) {
        // Extrahiere Extension aus Content-Type
        const typeMap: Record<string, string> = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'image/webp': 'webp',
          'image/svg+xml': 'svg',
        };
        fileExtension = typeMap[contentType] || 'jpg';
      }

      const fileName = `${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `events/${fileName}`,
        Body: imageBuffer,
        ContentType: contentType,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      return `https://hel1.your-objectstorage.com/${this.bucketName}/events/${fileName}`;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }
  async uploadImage(image: Express.Multer.File): Promise<string> {
    try {
      const fileExtension = image.originalname.split('.').pop() || 'jpg';
      const fileName = `${uuidv4()}.${fileExtension}`;

      // console.log('Uploading image with credentials:', {
      //   bucket: this.bucketName,
      //   fileName,
      //   contentType: image.mimetype,
      // });

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `events/${fileName}`,
        Body: image.buffer,
        ContentType: image.mimetype,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      return `https://hel1.your-objectstorage.com/${this.bucketName}/events/${fileName}`;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Lädt ein Bild von einer externen URL herunter und speichert es auf Hetzner Storage.
   * @param imageUrl - Die URL des Bildes
   * @param timeoutMs - Timeout in Millisekunden (Standard: 15000)
   * @returns Die neue URL auf Hetzner Storage oder null bei Fehler
   */
  async downloadAndUploadFromUrl(
    imageUrl: string,
    timeoutMs: number = 15000,
  ): Promise<string | null> {
    try {
      // Validiere URL
      const url = new URL(imageUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        console.warn(`Invalid protocol for image URL: ${imageUrl}`);
        return null;
      }

      // Download image
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: timeoutMs,
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0',
          'Accept': 'image/*,*/*;q=0.8',
        },
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 300,
      });

      const buffer = Buffer.from(response.data);

      // Bestimme Content-Type
      let contentType = response.headers['content-type'] || 'image/jpeg';
      // Falls Content-Type mehrere Werte hat (z.B. "image/jpeg; charset=utf-8")
      contentType = contentType.split(';')[0].trim();

      // Extrahiere Dateiname aus URL für Extension
      const urlPath = url.pathname;
      const originalFilename = urlPath.split('/').pop() || 'image.jpg';

      // Upload zu Hetzner
      const newUrl = await this.uploadImageFromBuffer(buffer, contentType, originalFilename);

      return newUrl;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          console.warn(`Timeout downloading image from ${imageUrl}`);
        } else if (error.response?.status === 404) {
          console.warn(`Image not found at ${imageUrl}`);
        } else if (error.response?.status === 403) {
          console.warn(`Access forbidden for image at ${imageUrl}`);
        } else {
          console.warn(`Failed to download image from ${imageUrl}: ${error.message}`);
        }
      } else {
        console.warn(`Error processing image from ${imageUrl}: ${error instanceof Error ? error.message : String(error)}`);
      }
      return null;
    }
  }
}
