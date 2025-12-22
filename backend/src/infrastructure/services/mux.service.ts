import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface MuxVideoAsset {
  id: string;
  status: string;
  playback_ids?: Array<{
    id: string;
    policy: string;
  }>;
  mp4_support?: string;
  hls_url?: string;
  mp4_url?: string;
}

export interface MuxUploadResponse {
  data: {
    id: string;
    status: string;
    url: string;
    test?: boolean;
  };
}

@Injectable()
export class MuxService {
  private readonly muxTokenId: string;
  private readonly muxTokenSecret: string;
  private readonly muxDataEnvironmentKey: string;
  private readonly axiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.muxTokenId = this.configService.get<string>('MUX_TOKEN_ID') || '';
    this.muxTokenSecret = this.configService.get<string>('MUX_TOKEN_SECRET') || '';
    this.muxDataEnvironmentKey =
      this.configService.get<string>('MUX_DATA_ENVIRONMENT_KEY') ||
      'hj77scvuijk0cjhhcv3ng2o3v';

    if (!this.muxTokenId || !this.muxTokenSecret) {
      console.warn('Mux credentials not configured');
    }

    // Erstelle Axios-Instanz mit Basic Auth für Mux API
    const credentials = Buffer.from(
      `${this.muxTokenId}:${this.muxTokenSecret}`,
    ).toString('base64');

    this.axiosInstance = axios.create({
      baseURL: 'https://api.mux.com',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Erstellt einen direkten Upload-URL für Video-Uploads zu Mux
   */
  async createDirectUpload(
    test: boolean = false,
  ): Promise<MuxUploadResponse> {
    try {
      const response = await this.axiosInstance.post('/video/v1/uploads', {
        test,
        new_asset_settings: {
          playback_policy: ['public'],
          mp4_support: 'standard',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to create Mux direct upload:', error);
      throw new Error(
        `Failed to create Mux direct upload: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Erstellt ein Video-Asset aus einer URL
   */
  async createAssetFromUrl(
    url: string,
    playbackPolicy: 'public' | 'signed' = 'public',
  ): Promise<MuxVideoAsset> {
    try {
      const response = await this.axiosInstance.post('/video/v1/assets', {
        input: url,
        playback_policy: [playbackPolicy],
        mp4_support: 'standard',
      });

      return response.data.data;
    } catch (error) {
      console.error('Failed to create Mux asset from URL:', error);
      throw new Error(
        `Failed to create Mux asset: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Ruft ein Video-Asset anhand der ID ab
   */
  async getAsset(assetId: string): Promise<MuxVideoAsset> {
    try {
      const response = await this.axiosInstance.get(
        `/video/v1/assets/${assetId}`,
      );

      return response.data.data;
    } catch (error) {
      console.error('Failed to get Mux asset:', error);
      throw new Error(
        `Failed to get Mux asset: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Löscht ein Video-Asset
   */
  async deleteAsset(assetId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/video/v1/assets/${assetId}`);
    } catch (error) {
      console.error('Failed to delete Mux asset:', error);
      throw new Error(
        `Failed to delete Mux asset: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Gibt den Mux Data Environment Key zurück (für Frontend-Integration)
   */
  getDataEnvironmentKey(): string {
    return this.muxDataEnvironmentKey;
  }

  /**
   * Erstellt eine Playback-URL für ein Asset
   */
  getPlaybackUrl(asset: MuxVideoAsset): string | null {
    if (!asset.playback_ids || asset.playback_ids.length === 0) {
      return null;
    }

    const playbackId = asset.playback_ids[0].id;
    return `https://stream.mux.com/${playbackId}.m3u8`;
  }

  /**
   * Erstellt eine MP4-URL für ein Asset (falls verfügbar)
   */
  getMp4Url(asset: MuxVideoAsset): string | null {
    if (!asset.playback_ids || asset.playback_ids.length === 0) {
      return null;
    }

    const playbackId = asset.playback_ids[0].id;
    return `https://stream.mux.com/${playbackId}/high.mp4`;
  }
}

