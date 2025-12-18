import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentService {
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

  async uploadDocument(document: Express.Multer.File): Promise<string> {
    try {
      const fileExtension = document.originalname.split('.').pop() || 'pdf';
      const fileName = `${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `documents/${fileName}`,
        Body: document.buffer,
        ContentType: document.mimetype,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      return `https://hel1.your-objectstorage.com/${this.bucketName}/documents/${fileName}`;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  async uploadDocuments(documents: Express.Multer.File[]): Promise<string[]> {
    try {
      const uploadPromises = documents.map((doc) => this.uploadDocument(doc));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Failed to upload documents:', error);
      throw new Error(`Failed to upload documents: ${error.message}`);
    }
  }
}
