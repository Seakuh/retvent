import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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

  @Get('/event/users')
  @UseGuards(JwtAuthGuard)
  async getRegisteredUsersForEvent(@Req() req) {
    const eventId = req.query.eventId;
    return this.registrationService.getRegisteredUsersForEvent(
      eventId,
      req.user.sub,
    );
  }

  @Get('/event/validators')
  @UseGuards(JwtAuthGuard)
  async getEventValidators(@Req() req) {
    const eventId = req.query.eventId;
    return this.registrationService.getEventValidators(eventId, req.user.sub);
  }

  @Get('/event/admin-data')
  @UseGuards(JwtAuthGuard)
  async getEventAdminData(@Req() req) {
    const eventId = req.query.eventId;
    return this.registrationService.getEventAdminData(eventId, req.user.sub);
  }

  @Post('/event/unregister')
  @UseGuards(JwtAuthGuard)
  async unregisterEvent(
    @Body() body: { eventId: string; reason?: string },
    @Req() req,
  ) {
    return this.registrationService.unregisterEvent(
      body.eventId,
      req.user.sub,
      body.reason,
    );
  }
}
