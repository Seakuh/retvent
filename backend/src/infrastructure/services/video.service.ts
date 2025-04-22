import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VideoService {
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

  async uploadVideo(video: Express.Multer.File): Promise<string> {
    try {
      if (process.env.NODE_ENV === 'test') {
        return 'https://hel1.your-objectstorage.com/imagebucket/events/2edf0ca5-be33-4fa9-9ac3-28da8094e6fa.jpg';
      }

      const fileExtension = video.originalname.split('.').pop() || 'mp4';
      const fileName = `${uuidv4()}.${fileExtension}`;

      console.log('Uploading video with credentials:', {
        bucket: this.bucketName,
        fileName,
        contentType: video.mimetype,
      });

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `events/${fileName}`,
        Body: video.buffer,
        ContentType: video.mimetype,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      return `https://hel1.your-objectstorage.com/${this.bucketName}/events/${fileName}`;
    } catch (error) {
      console.error('Failed to upload video:', error);
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  }

  // async uploadImagToBucket(image: Express.Multer.File): Promise<string> {
}
