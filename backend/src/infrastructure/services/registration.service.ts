import { MailerService } from '@nestjs-modules/mailer';
import { NotFoundException } from '@nestjs/common';
import { EventService } from 'src/application/services/event.service';
import { UserService } from 'src/application/services/user.service';

export class RegistrationService {
  constructor(
    private readonly eventService: EventService,
    private readonly userService: UserService,
    private readonly mailService: MailerService,
  ) {}

  async registerEvent(eventId: string, userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const event = await this.eventService.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Register Event
    this.eventService.registerEvent(eventId, userId);
    /// Add event to user registered events
    this.userService.registerForEvent(eventId, userId);
    /// Send email to user
    try {
      this.mailService.sendMail({
        to: user.email,
        subject: `🎫 Du hast dich für das Event ${event?.title || 'Event'} registriert`,
        text: `Du hast dich für das Event ${event?.title || 'Event'} registriert`,
        html: `<p>Du hast dich für das Event ${event?.title || 'Event'} registriert</p>`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }

    return {
      message: 'Event registered successfully',
    };
  }
}
