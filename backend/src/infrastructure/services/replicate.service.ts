import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ImageService } from './image.service';

export interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  input: {
    image?: string;
    prompt?: string;
    duration?: number;
    guidance_scale?: number;
    width?: number;
    height?: number;
  };
  output?: string | string[];
  error?: string;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  urls?: {
    get: string;
    cancel: string;
    stream?: string;
  };
}

export interface CreateVideoFromImageOptions {
  image: Express.Multer.File | Buffer | string; // File, Buffer oder URL
  prompt?: string;
  duration?: 5 | 10; // 5 oder 10 Sekunden
  guidance_scale?: number; // 0.0 bis 1.0
  width?: 720 | 1080; // Auflösung
  height?: 720 | 1080; // Auflösung
}

@Injectable()
export class ReplicateService {
  private readonly replicateApiToken: string;
  private readonly axiosInstance: AxiosInstance;
  private readonly klingModelVersion =
    '1a3f2d7321a5f38d932d85e3ee8e286ba278990f66293f1fac2d26c2b3798b8d'; // kling-v2.1

  constructor(
    private configService: ConfigService,
    private imageService: ImageService,
  ) {
    this.replicateApiToken =
    
      this.configService.get<string>('REPLICATE_API_TOKEN') || '';

    if (!this.replicateApiToken) {
      console.warn('Replicate API token not configured');
    }

    this.axiosInstance = axios.create({
      baseURL: 'https://api.replicate.com/v1',
      headers: {
        Authorization: `Token ${this.replicateApiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Erstellt ein Video aus einem Bild mit kling-v2.1
   */
  async createVideoFromImage(
    options: CreateVideoFromImageOptions,
  ): Promise<ReplicatePrediction> {
    try {
      // Bild-URL vorbereiten
      let imageUrl: string;

      if (Buffer.isBuffer(options.image)) {
        // Wenn Buffer, müssen wir es zuerst hochladen
        imageUrl = await this.uploadImageBuffer(options.image);
      } else if (typeof options.image === 'string') {
        // Wenn String, ist es bereits eine URL
        imageUrl = options.image;
      } else {
        // Express.Multer.File
        imageUrl = await this.uploadImageFile(options.image);
      }

      // Prüfe ob imageUrl gültig ist
      if (!imageUrl || imageUrl.trim().length === 0) {
        throw new Error('Image URL is required but was empty');
      }

      console.log('Creating Replicate prediction with image URL:', imageUrl);

      // Prediction erstellen
      // kling-v2.1 verwendet "start_image" als Parameter
      const response = await this.axiosInstance.post<ReplicatePrediction>(
        '/predictions',
        {
          version: this.klingModelVersion,
          input: {
            start_image: imageUrl, // kling-v2.1 verwendet "start_image" statt "image"
            prompt: options.prompt || '',
            duration: options.duration || 5,
            guidance_scale: options.guidance_scale || 0.5,
            width: options.width || 720,
            height: options.height || 720,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Failed to create video from image:', error);
      throw new Error(
        `Failed to create video from image: ${error.response?.data?.detail || error.message}`,
      );
    }
  }

  /**
   * Ruft den Status einer Prediction ab
   */
  async getPrediction(predictionId: string): Promise<ReplicatePrediction> {
    try {
      const response = await this.axiosInstance.get<ReplicatePrediction>(
        `/predictions/${predictionId}`,
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get prediction:', error);
      throw new Error(
        `Failed to get prediction: ${error.response?.data?.detail || error.message}`,
      );
    }
  }

  /**
   * Wartet auf das Ergebnis einer Prediction (Polling)
   */
  async waitForPrediction(
    predictionId: string,
    maxWaitTime: number = 300000, // 5 Minuten
    pollInterval: number = 2000, // 2 Sekunden
  ): Promise<ReplicatePrediction> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const prediction = await this.getPrediction(predictionId);

      if (prediction.status === 'succeeded') {
        return prediction;
      }

      if (prediction.status === 'failed' || prediction.status === 'canceled') {
        throw new Error(
          `Prediction ${prediction.status}: ${prediction.error || 'Unknown error'}`,
        );
      }

      // Warte vor dem nächsten Poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(
      `Prediction timeout after ${maxWaitTime}ms. Prediction ID: ${predictionId}`,
    );
  }

  /**
   * Erstellt ein Video und wartet auf das Ergebnis
   */
  async createVideoFromImageAndWait(
    options: CreateVideoFromImageOptions,
    maxWaitTime?: number,
  ): Promise<ReplicatePrediction> {
    const prediction = await this.createVideoFromImage(options);
    return await this.waitForPrediction(prediction.id, maxWaitTime);
  }

  /**
   * Bricht eine Prediction ab
   */
  async cancelPrediction(predictionId: string): Promise<void> {
    try {
      await this.axiosInstance.post(`/predictions/${predictionId}/cancel`);
    } catch (error) {
      console.error('Failed to cancel prediction:', error);
      throw new Error(
        `Failed to cancel prediction: ${error.response?.data?.detail || error.message}`,
      );
    }
  }

  /**
   * Lädt ein Bild-Buffer hoch und gibt die URL zurück
   */
  private async uploadImageBuffer(buffer: Buffer): Promise<string> {
    // Lade das Bild zu Hetzner S3 hoch und verwende die öffentliche URL
    // Erstelle ein temporäres Multer-File-ähnliches Objekt
    const tempFile = {
      buffer: buffer,
      originalname: 'image.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    return await this.imageService.uploadImage(tempFile);
  }

  /**
   * Lädt ein Multer-File hoch und gibt die URL zurück
   */
  private async uploadImageFile(file: Express.Multer.File): Promise<string> {
    // Wenn das File bereits eine URL hat, nutze diese
    if (file.path && file.path.startsWith('http')) {
      return file.path;
    }

    // Lade das Bild zu Hetzner S3 hoch
    if (file.buffer) {
      return await this.imageService.uploadImage(file);
    }

    throw new Error('File has no buffer or valid path');
  }
}

