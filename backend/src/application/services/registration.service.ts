import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
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
    const user = await this.userService.findByUserId(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const event = await this.eventService.findByEventId(eventId);
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
        subject: `🎫 REGISTRIERUNG ERFOLGREICH - ${event?.title || 'Event'}`,
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

  private getRegistrationTemplate(event: any, user: any): string {
    // Lade das HTML-Template
    const templatePath = path.join(__dirname, '../templates/registration.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    // Ersetze die Platzhalter mit den tatsächlichen Werten
    template = template.replace(
      /\{\{event\.title\}\}/g,
      event.title || 'Event',
    );
    template = template.replace(
      /\{\{event\.startDate\}\}/g,
      this.formatDate(event.startDate),
    );
    template = template.replace(
      /\{\{event\.startTime\}\}/g,
      this.formatTime(event.startDate),
    );
    template = template.replace(/\{\{event\.id\}\}/g, event.id || '');
    template = template.replace(
      /\{\{event\.qrCodeSrc\}\}/g,
      this.generateQRCode(event.id, user.id),
    );
    template = template.replace(
      /\{\{event\.termsUrl\}\}/g,
      event.termsUrl || '#',
    );
    template = template.replace(
      /\{\{event\.privacyUrl\}\}/g,
      event.privacyUrl || '#',
    );
    template = template.replace(
      /\{\{event\.supportEmail\}\}/g,
      event.supportEmail || 'support@event-scanner.com',
    );
    template = template.replace(
      /\{\{event\.year\}\}/g,
      new Date().getFullYear().toString(),
    );
    template = template.replace(
      /\{\{event\.organizerName\}\}/g,
      event.organizerName || 'Event Scanner',
    );

    return template;
  }

  private formatDate(date: Date | string): string {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatTime(date: Date | string): string {
    const eventDate = new Date(date);
    return eventDate.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private generateQRCode(eventId: string, userId: string): string {
    // Hier könntest du einen QR-Code generieren
    // Für jetzt geben wir eine Platzhalter-URL zurück
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://event-scanner.com/event/${eventId}?user=${userId}`;
  }
}
