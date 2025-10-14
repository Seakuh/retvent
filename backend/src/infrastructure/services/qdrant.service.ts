// src/qdrant/qdrant.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { createHash } from 'crypto';

const EVENTS_COLLECTION = process.env.QDRANT_EVENTS_COLLECTION || 'events';
const USERS_COLLECTION = process.env.QDRANT_USERS_COLLECTION || 'users';
const VECTOR_SIZE = Number(process.env.EMBEDDING_DIM || 1536);

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
    await Promise.all([
      this.ensureCollection(EVENTS_COLLECTION, this.eventIndexes()),
      this.ensureCollection(USERS_COLLECTION, this.userIndexes()),
    ]);
  }

  /** Erstellt die Collection, wenn sie nicht existiert, inkl. Payload-Indizes */
  private async ensureCollection(
    collectionName: string,
    indexes: Array<{ field_name: string; field_schema: any }>,
  ) {
    try {
      await this.client.getCollection(collectionName);
      this.logger.log(`Collection "${collectionName}" exists`);
    } catch {
      this.logger.log(`Creating collection "${collectionName}"…`);
      await this.client.createCollection(collectionName, {
        vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
        hnsw_config: { m: 16, ef_construct: 128 },
        optimizers_config: { default_segment_number: 2 },
      });
    }

    // Sinnvolle Payload-Indizes (optional, beschleunigt Filter) - auch bei bestehenden Collections prüfen
    for (const index of indexes) {
      await this.safeCreatePayloadIndex(
        collectionName,
        index.field_name,
        index.field_schema,
      );
    }
  }

  private eventIndexes() {
    return [
      { field_name: 'city', field_schema: 'keyword' },
      { field_name: 'category', field_schema: 'keyword' },
      { field_name: 'tags', field_schema: 'keyword' },
      { field_name: 'startTime', field_schema: 'integer' },
    ];
  }

  private userIndexes() {
    return [
      { field_name: 'roles', field_schema: 'keyword' },
      { field_name: 'genres', field_schema: 'keyword' },
      { field_name: 'technologies', field_schema: 'keyword' },
      { field_name: 'category', field_schema: 'keyword' },
      { field_name: 'city', field_schema: 'keyword' },
      { field_name: 'languages', field_schema: 'keyword' },
    ];
  }

  private async safeCreatePayloadIndex(
    collectionName: string,
    field_name: string,
    field_schema: any,
  ) {
    try {
      await this.client.createPayloadIndex(collectionName, {
        field_name,
        field_schema,
      });
    } catch (e) {
      const message = String(e);
      if (message.toLowerCase().includes('exist')) {
        this.logger.debug(
          `Payload index for "${field_name}" already exists on "${collectionName}"`,
        );
        return;
      }
      this.logger.warn(
        `Payload index for "${field_name}" skipped: ${message}`,
      );
    }
  }

  private mergeFilters(
    existing: Record<string, any> | undefined,
    additionalMust: Array<Record<string, any>> = [],
  ) {
    if (!additionalMust.length) {
      return existing;
    }
    if (!existing) {
      return { must: additionalMust };
    }
    return {
      ...existing,
      must: [...(existing.must ?? []), ...additionalMust],
    };
  }

  private async upsertPoints(
    collectionName: string,
    points: Array<{
      id: string | number;
      vector: number[];
      payload: Record<string, any>;
    }>,
  ) {
    if (!points.length) {
      return;
    }

    const sample = points[0];
    const normalizedSampleId = this.normalizePointId(sample.id);
    this.logger.debug(
      `Preparing upsert into "${collectionName}" (sample id: ${sample.id} -> ${normalizedSampleId}, vector length: ${sample.vector?.length}, payload keys: ${Object.keys(sample.payload ?? {}).join(', ')})`,
    );

    this.logger.log(
      `Upserting ${points.length} points into "${collectionName}"`,
    );

    try {
      return await this.client.upsert(collectionName, {
        wait: true,
        ordering: 'strong',
        points: points.map((p) => ({
          id: this.normalizePointId(p.id),
          vector: p.vector,
          payload: p.payload,
        })),
      });
    } catch (error) {
      this.logger.error(
        `Error upserting into "${collectionName}": ${this.extractErrorDetails(
          error,
        )}`,
      );
      throw error;
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
    return this.upsertPoints(EVENTS_COLLECTION, points);
  }

  /** User/Artists upserten (Vector + Payload) */
  async upsertUsers(
    points: Array<{
      id: string | number;
      vector: number[];
      payload: Record<string, any>;
    }>,
  ) {
    return this.upsertPoints(USERS_COLLECTION, points);
  }

  /** Ähnliche Events suchen (KNN) */
  async searchEventsSimilar(params: {
    vector: number[];
    limit?: number;
    filter?: any;
    scoreThreshold?: number;
    withPayload?: boolean;
    withVector?: boolean;
  }) {
    return this.search(EVENTS_COLLECTION, params);
  }

  /** Ähnliche User/Artists suchen */
  async searchUsersSimilar(params: {
    vector: number[];
    limit?: number;
    filter?: any;
    scoreThreshold?: number;
    withPayload?: boolean;
    withVector?: boolean;
    category?: string;
  }) {
    const { category, ...rest } = params;
    const filter = this.mergeFilters(
      rest.filter,
      category
        ? [
            {
              key: 'category',
              match: { value: category },
            },
          ]
        : [],
    );
    return this.search(USERS_COLLECTION, { ...rest, filter });
  }

  /** Freitext-Suche für Lineup-/Technik-Vorschläge */
  async searchUsersForLineup(params: {
    vector: number[];
    limit?: number;
    filter?: any;
    scoreThreshold?: number;
    withPayload?: boolean;
    withVector?: boolean;
    category?: string;
    roles?: string[];
    city?: string;
  }) {
    const { category, roles, city, ...rest } = params;
    const filterClauses: Array<Record<string, any>> = [];

    if (category) {
      filterClauses.push({
        key: 'category',
        match: { value: category },
      });
    }

    if (roles?.length) {
      filterClauses.push({
        key: 'roles',
        match: { any: roles },
      });
    }

    if (city) {
      filterClauses.push({
        key: 'city',
        match: { value: city },
      });
    }

    const filter = this.mergeFilters(rest.filter, filterClauses);
    return this.search(USERS_COLLECTION, { ...rest, filter });
  }

  private async search(
    collectionName: string,
    params: {
      vector: number[];
      limit?: number;
      filter?: any;
      scoreThreshold?: number;
      withPayload?: boolean;
      withVector?: boolean;
    },
  ) {
    const {
      vector,
      limit = 20,
      filter,
      scoreThreshold,
      withPayload = true,
      withVector = false,
    } = params;

    return this.client.search(collectionName, {
      vector,
      limit,
      with_payload: withPayload,
      with_vector: withVector,
      filter,
      score_threshold: scoreThreshold,
    });
  }

  /** Empfehlungen basierend auf positiven/negativen IDs */
  async recommendEvents(params: {
    positiveIds: (string | number)[];
    negativeIds?: (string | number)[];
    limit?: number;
    filter?: any;
    withPayload?: boolean;
    withVector?: boolean;
  }) {
    return this.recommend(EVENTS_COLLECTION, params);
  }

  async recommendUsers(params: {
    positiveIds: (string | number)[];
    negativeIds?: (string | number)[];
    limit?: number;
    filter?: any;
    withPayload?: boolean;
    withVector?: boolean;
  }) {
    return this.recommend(USERS_COLLECTION, params);
  }

  private async recommend(
    collectionName: string,
    params: {
      positiveIds: (string | number)[];
      negativeIds?: (string | number)[];
      limit?: number;
      filter?: any;
      withPayload?: boolean;
      withVector?: boolean;
    },
  ) {
    const {
      positiveIds,
      negativeIds = [],
      limit = 20,
      filter,
      withPayload = true,
      withVector = false,
    } = params;

    return this.client.recommend(collectionName, {
      positive: positiveIds.map((id) => this.normalizePointId(id)),
      negative: negativeIds.map((id) => this.normalizePointId(id)),
      limit,
      with_payload: withPayload,
      with_vector: withVector,
      filter,
    });
  }

  private normalizePointId(id: string | number) {
    if (typeof id === 'number') {
      if (!Number.isSafeInteger(id) || id < 0) {
        throw new Error(`Invalid numeric point id "${id}"`);
      }
      return id;
    }

    const trimmed = id.trim();
    const isUuid =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
        trimmed,
      );
    if (isUuid) {
      return trimmed.toLowerCase();
    }

    if (/^\d+$/.test(trimmed)) {
      const numeric = Number(trimmed);
      if (Number.isSafeInteger(numeric)) {
        return numeric;
      }
    }

    // derive stable UUID v5-style from arbitrary string
    const hash = createHash('sha1').update(trimmed).digest('hex');
    const timeLow = hash.slice(0, 8);
    const timeMid = hash.slice(8, 12);
    const timeHi =
      ((parseInt(hash.slice(12, 16), 16) & 0x0fff) | 0x5000)
        .toString(16)
        .padStart(4, '0');
    const clockSeq =
      ((parseInt(hash.slice(16, 20), 16) & 0x3fff) | 0x8000)
        .toString(16)
        .padStart(4, '0');
    const node = hash.slice(20, 32);
    return `${timeLow}-${timeMid}-${timeHi}-${clockSeq}-${node}`;
  }

  /** (Optional) Collection löschen/neu anlegen */
  async recreateCollection(collectionName: 'events' | 'users' = 'events') {
    try {
      await this.client.deleteCollection(
        collectionName === 'events' ? EVENTS_COLLECTION : USERS_COLLECTION,
      );
    } catch {}
    if (collectionName === 'events') {
      await this.ensureCollection(EVENTS_COLLECTION, this.eventIndexes());
    } else {
      await this.ensureCollection(USERS_COLLECTION, this.userIndexes());
    }
  }
}
