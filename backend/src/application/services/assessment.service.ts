import { Injectable } from '@nestjs/common';
import { ChatGPTService } from 'src/infrastructure/services/chatgpt.service';
import { CreateAssessmentDto } from 'src/presentation/dtos/create-assessment.dto';
import { QdrantService } from '../../infrastructure/services/qdrant.service';

@Injectable()
export class AssessmentService {
  constructor(
    private readonly chatgptService: ChatGPTService,
    private readonly qdrantService: QdrantService,
  ) {}

  async createAssessment(
    createAssessmentDto: CreateAssessmentDto,
    userId: string,
  ) {
    const text = JSON.stringify(createAssessmentDto);

    const embedding = await this.chatgptService.createEmbedding(text);
    if (!embedding) {
      throw new Error(
        'Failed to create embedding - ChatGPT service not initialized',
      );
    }
    console.log('embedding', embedding);
    const assessment = await this.qdrantService.upsertAssessments([
      {
        id: userId,
        vector: embedding,
        payload: createAssessmentDto,
      },
    ]);
    return assessment;
  }
}
