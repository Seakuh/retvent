import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

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

  async uploadImage(image: Express.Multer.File): Promise<string> {
    try {
      const fileExtension = image.originalname.split('.').pop() || 'jpg';
      const fileName = `${uuidv4()}.${fileExtension}`;

      console.log('Uploading image with credentials:', {
        bucket: this.bucketName,
        fileName,
        contentType: image.mimetype,
      });

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

  // async uploadImagToBucket(image: Express.Multer.File): Promise<string> {
}
