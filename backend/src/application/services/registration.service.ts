import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventService } from 'src/application/services/event.service';
import { UserService } from './user.service';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly eventService: EventService,
    private readonly userService: UserService,
    private readonly mailService: MailerService,
  ) {}

  async registerUserForEvent(eventId: string, userId: string) {
    console.log('registerUserForEvent', eventId, userId);
    console.log('userService', this.userService);

    const user = await this.userService.findByUserId(userId);
    console.log('user', user.username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const event = await this.eventService.findByEventId(eventId);
    console.log('event', event?.title);
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
        to: 'danielenderle1996@gmail.com',
        subject: `REGISTRIERUNG - ${event?.title || 'Event'} | 🎫 `,
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
