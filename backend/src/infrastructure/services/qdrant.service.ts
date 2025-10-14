// src/qdrant/qdrant.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

const COLLECTION = process.env.QDRANT_COLLECTION || 'events';

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private readonly client: QdrantClient;

  constructor() {
    if (!process.env.QDRANT_URL) {
      throw new Error('QDRANT_URL is required');
    }
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY, // optional
    });
  }

  async onModuleInit() {
    await this.ensureCollection();
  }

  /** Erstellt die Collection, wenn sie nicht existiert, inkl. Payload-Indizes */
  async ensureCollection() {
    const dim = Number(process.env.EMBEDDING_DIM || 1536);

    try {
      await this.client.getCollection(COLLECTION);
      this.logger.log(`Collection "${COLLECTION}" exists`);
    } catch {
      this.logger.log(`Creating collection "${COLLECTION}"…`);
      await this.client.createCollection(COLLECTION, {
        vectors: { size: dim, distance: 'Cosine' },
        hnsw_config: { m: 16, ef_construct: 128 },
        optimizers_config: { default_segment_number: 2 },
      });

      // sinnvolle Payload-Indizes (optional, beschleunigt Filter)
      await this.safeCreatePayloadIndex('city', 'keyword');
      await this.safeCreatePayloadIndex('tags', 'keyword');
      await this.safeCreatePayloadIndex('start_time', 'integer');
      await this.safeCreatePayloadIndex('language', 'keyword');
      await this.safeCreatePayloadIndex('is_event', 'keyword');
    }
  }

  private async safeCreatePayloadIndex(field_name: string, field_schema: any) {
    try {
      await this.client.createPayloadIndex(COLLECTION, {
        field_name,
        field_schema,
      });
    } catch (e) {
      this.logger.warn(
        `Payload index for "${field_name}" skipped/exists: ${String(e)}`,
      );
    }
  }

  /** Events upserten (Vector + Payload) */
  async upsertEvents(
    points: Array<{
      id: string | number;
      vector: number[];
      payload: Record<string, any>;
    }>,
  ) {
    this.logger.log(
      `Upserting ${points.length} payload: ${JSON.stringify(points[0].payload)} to Qdrant`,
    );
    try {
      return await this.client.upsert(COLLECTION, {
        wait: true,
        ordering: 'strong', // Use strong consistency for reliable writes
        points: points.map((p) => ({
          id: p.id,
          vector: p.vector,
          payload: p.payload,
        })),
      });
    } catch (error) {
      this.logger.error(`Error upserting events: ${error}`);
      throw error;
    }
  }

  /** Ähnliche Events suchen (KNN) */
  async searchSimilar(params: {
    vector: number[];
    limit?: number;
    filter?: any;
    scoreThreshold?: number;
    withPayload?: boolean;
    withVector?: boolean;
  }) {
    const {
      vector,
      limit = 20,
      filter,
      scoreThreshold,
      withPayload = true,
      withVector = false,
    } = params;

    return this.client.search(COLLECTION, {
      vector,
      limit,
      with_payload: withPayload,
      with_vector: withVector,
      filter,
      score_threshold: scoreThreshold,
    });
  }

  /** Empfehlungen basierend auf positiven/negativen IDs */
  async recommend(params: {
    positiveIds: (string | number)[];
    negativeIds?: (string | number)[];
    limit?: number;
    filter?: any;
    withPayload?: boolean;
    withVector?: boolean;
  }) {
    const {
      positiveIds,
      negativeIds = [],
      limit = 20,
      filter,
      withPayload = true,
      withVector = false,
    } = params;

    return this.client.recommend(COLLECTION, {
      positive: positiveIds,
      negative: negativeIds,
      limit,
      with_payload: withPayload,
      with_vector: withVector,
      filter,
    });
  }

  /** (Optional) Collection löschen/neu anlegen */
  async recreateCollection() {
    try {
      await this.client.deleteCollection(COLLECTION);
    } catch {}
    await this.ensureCollection();
  }
}
