import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Event } from 'src/core/domain';
import { ChatGPTService } from 'src/infrastructure/services/chatgpt.service';
import { EventService } from './event.service';

@Injectable()
export class EventEmbeddingService {
  private readonly logger = new Logger(EventEmbeddingService.name);
  private readonly BATCH_SIZE = 20;

  constructor(
    private readonly eventService: EventService,
    private readonly chatgptService: ChatGPTService,
  ) {}

  //@Cron(CronExpression.EVERY_10_SECONDS)
  @Cron('0 */15 * * * *') // alle 15 Minuten exakt
  async embedMissingEventsBatch() {
    this.logger.log('🔁 Embedding Cron gestartet…');

    const events = await this.eventService.findMissingEmbeddings(
      this.BATCH_SIZE,
    );

    this.logger.log(`🔍 Gefundene Events: ${events.length}`);

    for (const event of events) {
      try {
        this.logger.log(`🔍 Embedding Event: ${event.title} ${event.id}`);
        const text = this.buildEventText(event);
        const embedding = await this.chatgptService.createEmbedding(text);

        await this.eventService.updateEmbedding(event.id, embedding);

        this.logger.log(`✅ Event "${event.title}" eingebettet`);
      } catch (err) {
        this.logger.error(`❌ Fehler bei "${event.title}"`, err);
      }
    }
  }

  async embedMissingEvents() {
    const events = await this.eventService.findMissingEmbeddings(
      this.BATCH_SIZE,
    );

    for (const event of events) {
      const text = this.buildEventText(event);

      try {
        const embedding = await this.chatgptService.createEmbedding(text);

        await this.eventService.updateEmbedding(event.id, embedding);

        this.logger.log(`✅ Embedded Event: ${event.title}`);
      } catch (err) {
        this.logger.error(`❌ Error embedding event ${event.id}`, err);
      }
    }
  }

  async searchByText(query: string): Promise<Event[]> {
    const embeddingResponse = await this.chatgptService.createEmbedding(query);

    const events = await this.eventService.findAllWithEmbedding(100);

    const scored = events
      .map((event) => ({
        event,
        similarity: this.cosineSimilarity(embeddingResponse, event.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);

    return scored.map((s) => s.event);
  }

  private cosineSimilarity(a: number[], b: number[]) {
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dot / (magA * magB);
  }

  private buildEventText(event: Event): string {
    return [
      event.title ?? '',
      event.description ?? '',
      event.city ?? '',
      event.category ?? '',
      event.tags?.join(', ') ?? '',
      event.lineup?.map((l) => l.name).join(', ') ?? '',
    ]
      .filter(Boolean)
      .join(' | ');
  }
}
