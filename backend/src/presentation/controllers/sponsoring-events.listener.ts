import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Sponsor } from './entities/sponsor.entity';
import { SponsoringGateway } from './sponsoring.gateway';

@Injectable()
export class SponsoringEventsListener {
  constructor(private sponsoringGateway: SponsoringGateway) {}

  @OnEvent('sponsor.created')
  handleSponsorCreated(sponsor: Sponsor) {
    this.sponsoringGateway.emitNewSponsor(sponsor);
  }

  @OnEvent('sponsor.stats.updated')
  handleStatsUpdated(data: { eventId: number; stats: any }) {
    this.sponsoringGateway.emitUpdatedStats(data.eventId, data.stats);
  }
}
