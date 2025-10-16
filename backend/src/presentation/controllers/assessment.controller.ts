import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AssessmentService } from 'src/application/services/assessment.service';
import { User } from 'src/core/domain/user';
import { User as UserDecorator } from '../decorators/user.decorator';
import { CreateAssessmentDto } from '../dtos/create-assessment.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post('self')
  @UseGuards(JwtAuthGuard)
  async createAssessment(
    @Body() createAssessmentDto: CreateAssessmentDto,
    @UserDecorator() user: User,
  ) {
    return this.assessmentService.createAssessment(
      createAssessmentDto,
      user.sub,
    );
  }
}
