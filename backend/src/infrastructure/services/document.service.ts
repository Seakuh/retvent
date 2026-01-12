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

  /**
   * Lädt ein Dokument von einem Buffer hoch
   * 
   * @param documentBuffer - Der Buffer des Dokuments
   * @param contentType - MIME-Type des Dokuments (z.B. 'application/pdf', 'application/msword')
   * @param originalFilename - Optional: Original-Dateiname für Dateiendung
   * @returns URL des hochgeladenen Dokuments
   */
  async uploadDocumentFromBuffer(
    documentBuffer: Buffer,
    contentType: string = 'application/pdf',
    originalFilename?: string,
  ): Promise<string> {
    try {
      // Bestimme Dateiendung aus Content-Type oder Original-Dateiname
      let fileExtension = 'pdf';
      
      if (originalFilename) {
        const ext = originalFilename.split('.').pop()?.toLowerCase();
        if (ext && ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'].includes(ext)) {
          fileExtension = ext;
        }
      } else if (contentType) {
        // Extrahiere Extension aus Content-Type
        const typeMap: Record<string, string> = {
          'application/pdf': 'pdf',
          'application/msword': 'doc',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
          'application/vnd.ms-excel': 'xls',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
          'application/vnd.ms-powerpoint': 'ppt',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
          'text/plain': 'txt',
          'application/rtf': 'rtf',
          'application/vnd.oasis.opendocument.text': 'odt',
          'application/vnd.oasis.opendocument.spreadsheet': 'ods',
          'application/vnd.oasis.opendocument.presentation': 'odp',
        };
        fileExtension = typeMap[contentType] || 'pdf';
      }

      const fileName = `${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `documents/${fileName}`,
        Body: documentBuffer,
        ContentType: contentType,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      return `https://hel1.your-objectstorage.com/${this.bucketName}/documents/${fileName}`;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Lädt ein Dokument von einem Express.Multer.File hoch
   * 
   * @param file - Das hochgeladene File-Objekt
   * @returns URL des hochgeladenen Dokuments
   */
  async uploadDocument(file: Express.Multer.File): Promise<string> {
    try {
      const fileExtension = file.originalname.split('.').pop() || 'pdf';
      const fileName = `${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `documents/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      return `https://hel1.your-objectstorage.com/${this.bucketName}/documents/${fileName}`;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Lädt mehrere Dokumente hoch
   * 
   * @param files - Array von hochgeladenen File-Objekten
   * @returns Array von URLs der hochgeladenen Dokumente
   */
  async uploadDocuments(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadDocument(file));
    return Promise.all(uploadPromises);
  }
}

