import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { EventService } from 'src/application/services/event.service';
import { ProfileService } from './profile.service';
import { TicketsService } from './ticket.service';
import { UserService } from './user.service';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly eventService: EventService,
    private readonly userService: UserService,
    private readonly mailService: MailerService,
    private readonly profileService: ProfileService,
    private readonly ticketsService: TicketsService,
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

    // Check if user is already registered
    if (user.registeredEventIds && user.registeredEventIds.includes(eventId)) {
      throw new BadRequestException(
        'Du bist bereits für dieses Event registriert',
      );
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
        html: this.getRegistrationTemplate(event, user),
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }

    return {
      message: 'Event registered successfully',
    };
  }

  async unregisterEvent(eventId: string, userId: string, reason?: string) {
    const user = await this.userService.findByUserId(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const event = await this.eventService.findByEventId(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    this.eventService.unregisterEvent(eventId, userId);
    this.userService.unregisterFromEvent(eventId, userId);

    if (reason && reason.length > 0) {
      const host = await this.userService.findByUsername(event.hostUsername);
      console.log('host', host);
      if (!host) {
        throw new NotFoundException('Host not found');
      }

      const emailHtml = this.getUnregistrationNotificationTemplate(
        event,
        user,
        reason,
      );

      try {
        await this.mailService.sendMail({
          to: host.email || 'noreply@eventscanner.com',
          subject: `🚫 Abmeldung für ${event?.title || 'Event'}`,
          text: `${user.email} hat sich von deinem Event "${event?.title || 'Event'}" abgemeldet. Grund: ${reason}`,
          html: emailHtml,
        });
      } catch (error) {
        console.error(
          'Error sending unregistration notification email:',
          error,
        );
      }
    }

    return {
      message: 'Event unregistered successfully',
    };
  }

  async getEventValidators(eventId: string, userId: string) {
    const event = await this.eventService.findByEventId(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only host can view validators
    const user = await this.userService.findByUserId(userId);
    const isHost =
      event.hostUsername === user?.username || event.hostId === userId;

    if (!isHost) {
      throw new ForbiddenException('Only the event host can view validators');
    }

    // Get validators
    const validatorIds = event.validators || [];

    // Fetch profiles for all validators
    const validators = await Promise.all(
      validatorIds.map(async (validatorId) => {
        // Try to find by userId first, then by username
        let profile = await this.profileService.findByUserId(validatorId);

        if (!profile) {
          // Try finding by username
          profile = await this.profileService.findByUsername(validatorId);
        }

        return {
          id: validatorId,
          username: profile?.username || validatorId,
          imageUrl: profile?.profileImageUrl || null,
        };
      }),
    );

    return {
      eventId: event.id,
      eventTitle: event.title,
      validatorCount: validators.length,
      validators: validators,
    };
  }

  async getRegisteredUsersForEvent(eventId: string, userId: string) {
    const event = await this.eventService.findByEventId(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is host or validator/moderator
    const user = await this.userService.findByUserId(userId);
    const isHost =
      event.hostUsername === user?.username || event.hostId === userId;
    const isValidator =
      event.validators?.includes(userId) ||
      event.validators?.includes(user?.username);

    if (!isHost && !isValidator) {
      throw new ForbiddenException(
        'You are not authorized to view registered users for this event',
      );
    }

    // Get registered user IDs
    const registeredUserIds = event.registeredUserIds || [];

    // Fetch all tickets for this event
    const tickets = await this.ticketsService.getTicketsByEventId(event.id);

    // Create a map of userId -> ticket status
    const ticketStatusMap = new Map<string, string>();
    for (const ticket of tickets) {
      // Find user by email from ticket
      const ticketUser = await this.userService.findByEmail(ticket.email);
      if (ticketUser) {
        ticketStatusMap.set(ticketUser.id, ticket.status);
      }
    }

    // Fetch profiles for all registered users
    const registeredUsers = await Promise.all(
      registeredUserIds.map(async (uid) => {
        const profile = await this.profileService.findByUserId(uid);
        const ticketStatus = ticketStatusMap.get(uid) || 'pending';

        return {
          id: uid,
          username: profile?.username || null,
          imageUrl: profile?.profileImageUrl || null,
          status: ticketStatus,
          isApproved: ticketStatus === 'active' || ticketStatus === 'validated',
        };
      }),
    );

    return {
      eventId: event.id,
      eventTitle: event.title,
      registeredCount: registeredUsers.length,
      approvedCount: registeredUsers.filter((u) => u.isApproved).length,
      pendingCount: registeredUsers.filter((u) => u.status === 'pending')
        .length,
      users: registeredUsers,
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

  private getUnregistrationNotificationTemplate(
    event: any,
    user: any,
    reason: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Abmeldung von Event</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 0; text-align: center;">
              <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                      🚫 Event-Abmeldung
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hallo,
                    </p>

                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Ein Teilnehmer hat sich von deinem Event abgemeldet:
                    </p>

                    <!-- Event Info Box -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="color: #666666; font-size: 14px; margin: 0 0 8px 0;">Event:</p>
                          <p style="color: #333333; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
                            ${event?.title || 'Event'}
                          </p>

                          <p style="color: #666666; font-size: 14px; margin: 0 0 8px 0;">Teilnehmer:</p>
                          <p style="color: #333333; font-size: 16px; margin: 0;">
                            ${user.email || 'Unbekannt'}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Reason Box -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #fff3cd; border-radius: 8px; overflow: hidden; border-left: 4px solid #ffc107;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="color: #856404; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Abmeldegrund:</p>
                          <p style="color: #856404; font-size: 16px; margin: 0; line-height: 1.5;">
                            ${reason}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                      Diese Nachricht wurde automatisch generiert, da der Teilnehmer einen Abmeldegrund angegeben hat.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0;">
                      Event Scanner - Deine Event-Management-Plattform
                    </p>
                    <p style="color: #adb5bd; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} Event Scanner. Alle Rechte vorbehalten.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
