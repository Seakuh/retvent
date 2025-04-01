import { Controller, Get, Query } from '@nestjs/common';
import { EventEmbeddingService } from 'src/application/services/eventembedding.service';

@Controller('search')
export class SearchController {
  constructor(private readonly embeddingService: EventEmbeddingService) {}

  @Get()
  async search(@Query('q') q: string) {
    console.log('search', q);
    return this.embeddingService.searchByText(q);
  }
}
