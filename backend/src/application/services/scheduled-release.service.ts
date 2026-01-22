import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventService } from './event.service';

@Injectable()
export class ScheduledReleaseService {
  private readonly logger = new Logger(ScheduledReleaseService.name);

  constructor(private readonly eventService: EventService) {}

  /**
   * Cron-Job, der alle 5 Minuten ausgeführt wird
   * Veröffentlicht automatisch Events, deren scheduledReleaseDate erreicht wurde
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processScheduledReleases() {
    this.logger.log('🔄 Verarbeite geplante Releases...');
    
    try {
      const publishedCount = await this.eventService.processScheduledReleases();
      
      if (publishedCount > 0) {
        this.logger.log(`✅ ${publishedCount} Event(s) automatisch veröffentlicht`);
      } else {
        this.logger.debug('Keine Events zum Veröffentlichen gefunden');
      }
    } catch (error) {
      this.logger.error('❌ Fehler beim Verarbeiten geplanter Releases:', error);
    }
  }
}
