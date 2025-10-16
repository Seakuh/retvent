// src/qdrant/qdrant.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { createHash } from 'crypto';

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private readonly client: QdrantClient;
  private readonly EVENTS_COLLECTION: string;
  private readonly USERS_COLLECTION: string;
  private readonly VECTOR_SIZE: number;
  private readonly ASSESSMENTS_COLLECTION: string;
  constructor(private configService: ConfigService) {
    this.EVENTS_COLLECTION =
      this.configService.get<string>('QDRANT_EVENTS_COLLECTION') ||
      'event_embeddings';
    this.USERS_COLLECTION =
      this.configService.get<string>('QDRANT_USERS_COLLECTION') ||
      'user_embeddings';
    this.VECTOR_SIZE = Number(
      this.configService.get<string>('EMBEDDING_DIM') || 1536,
    );
    this.ASSESSMENTS_COLLECTION =
      this.configService.get<string>('QDRANT_ASSESSMENTS_COLLECTION') ||
      'assessment_embeddings';
    this.client = new QdrantClient({
      url: configService.get<string>('QDRANT_URL'),
      apiKey: configService.get<string>('QDRANT_API_KEY'), // optional
    });
  }

  async onModuleInit() {
    await Promise.all([
      this.ensureCollection(this.EVENTS_COLLECTION, this.eventIndexes()),
      this.ensureCollection(this.USERS_COLLECTION, this.userIndexes()),
      this.ensureCollection(
        this.ASSESSMENTS_COLLECTION,
        this.assessmentIndexes(),
      ),
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
        vectors: { size: this.VECTOR_SIZE, distance: 'Cosine' },
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
      { field_name: 'start_time', field_schema: 'integer' },
      { field_name: 'startTime', field_schema: 'integer' },
      { field_name: 'popularity', field_schema: 'float' },
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
      { field_name: 'priceTier', field_schema: 'integer' },
      { field_name: 'dayRateMin', field_schema: 'float' },
      { field_name: 'dayRateMax', field_schema: 'float' },
      { field_name: 'travelRadiusKm', field_schema: 'integer' },
    ];
  }

  private assessmentIndexes() {
    return [
      { field_name: 'playStyle', field_schema: 'keyword' },
      { field_name: 'loose', field_schema: 'integer' },
      { field_name: 'tight', field_schema: 'integer' },
      { field_name: 'aggressive', field_schema: 'integer' },
      { field_name: 'passive', field_schema: 'integer' },
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
      this.logger.warn(`Payload index for "${field_name}" skipped: ${message}`);
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

    points.forEach((point, index) => {
      this.assertVectorSize(point.vector, `upsert[${index}]`);
    });

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
          payload: this.preparePayload(collectionName, p.id, p.payload),
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
    return this.upsertPoints(this.EVENTS_COLLECTION, points);
  }

  /** User/Artists upserten (Vector + Payload) */
  async upsertUsers(
    points: Array<{
      id: string | number;
      vector: number[];
      payload: Record<string, any>;
    }>,
  ) {
    return this.upsertPoints(this.USERS_COLLECTION, points);
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
    return this.search(this.EVENTS_COLLECTION, params);
  }

  async searchEventsSimilarById(
    id: string | number,
    params: {
      limit?: number;

      filter?: any;
      scoreThreshold?: number;
      withPayload?: boolean;
      withVector?: boolean;
    } = {},
  ) {
    const vector = await this.loadVectorById(this.EVENTS_COLLECTION, id);
    return this.search(this.EVENTS_COLLECTION, {
      vector,
      ...params,
    });
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
    return this.search(this.USERS_COLLECTION, { ...rest, filter });
  }

  async searchUsersSimilarById(
    id: string | number,
    params: {
      limit?: number;
      filter?: any;
      scoreThreshold?: number;
      withPayload?: boolean;
      withVector?: boolean;
      category?: string;
    } = {},
  ) {
    const vector = await this.loadVectorById(this.USERS_COLLECTION, id);
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
    return this.search(this.USERS_COLLECTION, { ...rest, vector, filter });
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
    return this.search(this.USERS_COLLECTION, { ...rest, filter });
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

    this.assertVectorSize(vector, 'search');

    try {
      return await this.client.search(collectionName, {
        vector,
        limit,
        with_payload: withPayload,
        with_vector: withVector,
        filter,
        score_threshold: scoreThreshold,
      });
    } catch (error) {
      this.logger.error(
        `Error searching "${collectionName}": ${this.extractErrorDetails(
          error,
        )}`,
      );
      throw error;
    }
  }

  async searchAssessments(params: {
    vector: number[];
    limit?: number;
    filter?: any;
    scoreThreshold?: number;
    withPayload?: boolean;
    withVector?: boolean;
  }) {
    return this.search(this.ASSESSMENTS_COLLECTION, params);
  }

  async upsertAssessments(
    points: Array<{
      id: string | number;
      vector: number[];
      payload: Record<string, any>;
    }>,
  ) {
    return this.upsertPoints(this.ASSESSMENTS_COLLECTION, points);
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
    return this.recommend(this.EVENTS_COLLECTION, params);
  }

  async recommendUsers(params: {
    positiveIds: (string | number)[];
    negativeIds?: (string | number)[];
    limit?: number;
    filter?: any;
    withPayload?: boolean;
    withVector?: boolean;
  }) {
    return this.recommend(this.USERS_COLLECTION, params);
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

  async deleteEvents(ids: (string | number)[]) {
    return this.deletePoints(this.EVENTS_COLLECTION, ids);
  }

  async deleteUsers(ids: (string | number)[]) {
    return this.deletePoints(this.USERS_COLLECTION, ids);
  }

  async retrieveEvents(
    ids: (string | number)[],
    options: { withPayload?: boolean; withVector?: boolean } = {},
  ) {
    return this.retrievePoints(this.EVENTS_COLLECTION, ids, options);
  }

  async retrieveUsers(
    ids: (string | number)[],
    options: { withPayload?: boolean; withVector?: boolean } = {},
  ) {
    return this.retrievePoints(this.USERS_COLLECTION, ids, options);
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
    const timeHi = ((parseInt(hash.slice(12, 16), 16) & 0x0fff) | 0x5000)
      .toString(16)
      .padStart(4, '0');
    const clockSeq = ((parseInt(hash.slice(16, 20), 16) & 0x3fff) | 0x8000)
      .toString(16)
      .padStart(4, '0');
    const node = hash.slice(20, 32);
    return `${timeLow}-${timeMid}-${timeHi}-${clockSeq}-${node}`;
  }

  private async loadVectorById(collectionName: string, id: string | number) {
    const normalizedId = this.normalizePointId(id);
    let point;
    try {
      [point] = await this.client.retrieve(collectionName, {
        ids: [normalizedId],
        with_vector: true,
        with_payload: false,
      });
    } catch (error) {
      this.logger.error(
        `Error retrieving vector ${normalizedId} from "${collectionName}": ${this.extractErrorDetails(
          error,
        )}`,
      );
      throw error;
    }
    if (!point || !point.vector) {
      throw new Error(
        `Vector for id "${id}" (${normalizedId}) not found in "${collectionName}"`,
      );
    }
    const vector = point.vector as number[];
    this.assertVectorSize(vector, `loadVectorById(${normalizedId})`);
    return vector;
  }

  private async deletePoints(collectionName: string, ids: (string | number)[]) {
    if (!ids.length) {
      return;
    }
    const normalized = ids.map((id) => this.normalizePointId(id));
    this.logger.log(
      `Deleting ${normalized.length} points from "${collectionName}"`,
    );
    try {
      return await this.client.delete(collectionName, { points: normalized });
    } catch (error) {
      this.logger.error(
        `Error deleting from "${collectionName}": ${this.extractErrorDetails(
          error,
        )}`,
      );
      throw error;
    }
  }

  private async retrievePoints(
    collectionName: string,
    ids: (string | number)[],
    options: { withPayload?: boolean; withVector?: boolean } = {},
  ) {
    if (!ids.length) {
      return [];
    }
    const normalized = ids.map((id) => this.normalizePointId(id));
    try {
      return await this.client.retrieve(collectionName, {
        ids: normalized,
        with_payload: options.withPayload ?? true,
        with_vector: options.withVector ?? false,
      });
    } catch (error) {
      this.logger.error(
        `Error retrieving from "${collectionName}": ${this.extractErrorDetails(
          error,
        )}`,
      );
      throw error;
    }
  }

  private assertVectorSize(vector: number[] | undefined, context: string) {
    if (!Array.isArray(vector)) {
      throw new Error(`Vector missing for ${context}`);
    }
    if (vector.length !== this.VECTOR_SIZE) {
      throw new Error(
        `Vector length mismatch for ${context}: expected ${this.VECTOR_SIZE}, got ${vector.length}`,
      );
    }
  }

  private preparePayload(
    collectionName: string,
    rawId: string | number,
    payload: Record<string, any>,
  ) {
    const normalizedId = String(rawId);
    const enriched: Record<string, any> = { ...payload };

    if (enriched.id === undefined) {
      enriched.id = normalizedId;
    }

    if (collectionName === this.EVENTS_COLLECTION) {
      if (enriched.eventId === undefined) {
        enriched.eventId = normalizedId;
      }
    } else if (collectionName === this.USERS_COLLECTION) {
      if (enriched.userId === undefined) {
        enriched.userId = normalizedId;
      }
    }

    return this.cleanPayload(enriched);
  }

  private cleanPayload(payload: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => {
        if (value === undefined || value === null) {
          return false;
        }
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return true;
      }),
    );
  }

  private extractErrorDetails(error: any) {
    if (!error) {
      return 'Unknown error';
    }

    const parts: string[] = [];
    const name = error.name ?? error.constructor?.name;
    const message = error.message ?? String(error);
    const status = error.response?.status ?? error.status;
    const responseData =
      error.response?.data ?? error.body ?? error.data ?? error.details;

    if (name) {
      parts.push(`name=${name}`);
    }
    if (status) {
      parts.push(`status=${status}`);
    }
    if (message) {
      parts.push(`message=${message}`);
    }

    if (responseData) {
      try {
        parts.push(`response=${JSON.stringify(responseData)}`);
      } catch {
        parts.push(`response=${String(responseData)}`);
      }
    }

    if (!parts.length) {
      return String(error);
    }

    return parts.join(', ');
  }

  /** (Optional) Collection löschen/neu anlegen */
  async recreateCollection(
    collectionName:
      | 'events'
      | 'users'
      | typeof this.EVENTS_COLLECTION
      | typeof this.USERS_COLLECTION = this.EVENTS_COLLECTION,
  ) {
    const targetCollection =
      collectionName === 'events' || collectionName === this.EVENTS_COLLECTION
        ? this.EVENTS_COLLECTION
        : this.USERS_COLLECTION;
    try {
      await this.client.deleteCollection(targetCollection);
    } catch {}
    await this.ensureCollection(
      targetCollection,
      targetCollection === this.EVENTS_COLLECTION
        ? this.eventIndexes()
        : this.userIndexes(),
    );
  }
}
