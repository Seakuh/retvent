import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RegistrationService } from 'src/application/services/registration.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('/event')
  @UseGuards(JwtAuthGuard)
  async registerEvent(@Body() body: { eventId: string }, @Req() req) {
    return this.registrationService.registerUserForEvent(
      body.eventId,
      req.user.sub,
    );
  }
}
