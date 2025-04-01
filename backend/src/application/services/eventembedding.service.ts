import { Injectable, Logger } from '@nestjs/common';
import { Event } from 'src/core/domain';
import { IEventRepository } from 'src/core/repositories/event.repository.interface';
import { ChatGPTService } from 'src/infrastructure/services/chatgpt.service';
@Injectable()
export class EventEmbeddingService {
  private readonly logger = new Logger(EventEmbeddingService.name);

  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly chatgptService: ChatGPTService,
  ) {}

  async embedMissingEvents() {
    const events = await this.eventRepository.findMissingEmbeddings();

    for (const event of events) {
      const text = this.buildEventText(event);

      try {
        const embedding = await this.chatgptService.createEmbedding(text);

        await this.eventRepository.updateEmbedding(event.id, embedding);

        this.logger.log(`✅ Embedded Event: ${event.title}`);
      } catch (err) {
        this.logger.error(`❌ Error embedding event ${event.id}`, err);
      }
    }
  }

  private buildEventText(event: Event): string {
    return [
      event.title,
      event.description,
      event.city,
      event.category,
      event.tags?.join(', '),
      event.lineup?.map((l) => l.name).join(', '),
    ]
      .filter(Boolean)
      .join(' | ');
  }
}
