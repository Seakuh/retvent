import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventService } from 'src/application/services/event.service';
import { GroupService } from './group.service';
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
    private readonly groupService: GroupService,
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
    // Add user to event group
    this.groupService.createOrJoinGroup(userId, {
      name: event.title,
      description: event.description,
      imageUrl: event.imageUrl,
      eventId: event.id,
      isPublic: false,
    });
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

  async getEventAdminData(eventId: string, userId: string) {
    const event = await this.eventService.findByEventId(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is host or validator
    const user = await this.userService.findByUserId(userId);
    const isHost =
      event.hostUsername === user?.username || event.hostId === userId;
    const isValidator =
      event.validators?.includes(userId) ||
      event.validators?.includes(user?.username);

    if (!isHost && !isValidator) {
      throw new ForbiddenException(
        'You are not authorized to view admin data for this event',
      );
    }

    // Get validators (only for host)
    let validators = [];
    if (isHost) {
      const validatorIds = event.validators || [];
      validators = await Promise.all(
        validatorIds.map(async (validatorId) => {
          let profile = await this.profileService.findByUserId(validatorId);
          if (!profile) {
            profile = await this.profileService.findByUsername(validatorId);
          }
          return {
            id: validatorId,
            username: profile?.username || validatorId,
            imageUrl: profile?.profileImageUrl || null,
          };
        }),
      );
    }

    // Get registered users
    const registeredUserIds = event.registeredUserIds || [];

    // Fetch all tickets for this event
    const tickets = await this.ticketsService.getTicketsByEventId(event.id);

    // Create a map of userId -> ticket
    const ticketMap = new Map<string, any>();
    for (const ticket of tickets) {
      const ticketUser = await this.userService.findByEmail(ticket.email);
      if (ticketUser) {
        ticketMap.set(ticketUser.id, {
          ticketId: ticket.ticketId,
          status: ticket.status,
          createdAt: ticket.createdAt,
          validatedAt: ticket.validatedAt,
        });
      }
    }

    // Fetch profiles for all registered users
    const registeredUsers = await Promise.all(
      registeredUserIds.map(async (uid) => {
        const profile = await this.profileService.findByUserId(uid);
        const ticket = ticketMap.get(uid);
        const ticketStatus = ticket?.status || 'pending';

        return {
          id: uid,
          username: profile?.username || null,
          imageUrl: profile?.profileImageUrl || null,
          email: profile?.email || null,
          status: ticketStatus,
          isApproved: ticketStatus === 'active' || ticketStatus === 'validated',
          ticketId: ticket?.ticketId || null,
          registeredAt: ticket?.createdAt || null,
          validatedAt: ticket?.validatedAt || null,
        };
      }),
    );

    // Calculate statistics
    const approvedUsers = registeredUsers.filter((u) => u.isApproved);
    const pendingUsers = registeredUsers.filter((u) => u.status === 'pending');
    const validatedUsers = registeredUsers.filter(
      (u) => u.status === 'validated',
    );

    return {
      eventId: event.id,
      eventTitle: event.title,
      eventStartDate: event.startDate,
      eventCapacity: event.capacity || null,
      isHost: isHost,
      isValidator: isValidator,

      // Statistics
      statistics: {
        totalRegistrations: registeredUsers.length,
        approvedCount: approvedUsers.length,
        pendingCount: pendingUsers.length,
        validatedCount: validatedUsers.length,
        capacityUsage:
          event.capacity && event.capacity > 0
            ? Math.round((registeredUsers.length / event.capacity) * 100)
            : null,
      },

      // Validators (only for host)
      validators: isHost
        ? {
            count: validators.length,
            list: validators,
          }
        : null,

      // Registered users
      registeredUsers: {
        approved: approvedUsers,
        pending: pendingUsers,
        validated: validatedUsers,
        all: registeredUsers,
      },
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
    let template = this.registrationTemplate(event, user);

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

  private registrationTemplate = (event: any, user: any): string => {
    return `
  <!doctype html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Registrierungsbestätigung</title>
    <!-- Für Clients mit Dark Mode -->
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
  </head>
  <body style="margin: 0; padding: 0; background: #f4f5f7">
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background: #f4f5f7"
    >
      <tr>
        <td align="center" style="padding: 24px">
          <!-- Card -->
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 640px;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              border: 1px solid #e6e8eb;
            "
          >
            <!-- Header -->
            <tr>
              <td style="padding: 24px 24px 8px 24px; text-align: left">
                <div
                  style="
                    font-family:
                      Inter,
                      Segoe UI,
                      Arial,
                      sans-serif;
                    font-size: 14px;
                    letter-spacing: 0.4px;
                    color: #6b7280;
                    text-transform: uppercase;
                  "
                >
                  Registrierungsbestätigung
                </div>
                <h1
                  style="
                    margin: 8px 0 0 0;
                    font-family:
                      Inter,
                      Segoe UI,
                      Arial,
                      sans-serif;
                    font-weight: 650;
                    font-size: 22px;
                    line-height: 1.3;
                    color: #111827;
                  "
                >
                  🎫 {{event.title}}
                </h1>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="height: 1px; background: #eef0f3"></td>
            </tr>

            <!-- Details -->
            <tr>
              <td style="padding: 20px 24px 8px 24px">
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td
                      style="
                        font-family:
                          Inter,
                          Segoe UI,
                          Arial,
                          sans-serif;
                        font-size: 15px;
                        color: #374151;
                        padding: 4px 0;
                      "
                    >
                      <strong style="color: #111827">Startdatum:</strong>
                      <span style="margin-left: 6px; color: #374151"
                        >{{event.startDate}}</span
                      >
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="
                        font-family:
                          Inter,
                          Segoe UI,
                          Arial,
                          sans-serif;
                        font-size: 15px;
                        color: #374151;
                        padding: 4px 0;
                      "
                    >
                      <strong style="color: #111827">Startzeit:</strong>
                      <span style="margin-left: 6px; color: #374151"
                        >{{event.startTime}}</span
                      >
                    </td>
                  </tr>

                  <!-- Website (optional: nur einfügen, wenn vorhanden) -->
                  <!-- {{event.#if website}}
                <tr>
                  <td style="font-family:Inter,Segoe UI,Arial,sans-serif;font-size:15px;color:#374151;padding:4px 0;">
                    <strong style="color:#111827;">Website:</strong>
                    <a href="{{event.website}}" style="margin-left:6px;color:#2563eb;text-decoration:none;">{{event.website}}</a>
                  </td>
                </tr>
                {{event.if website}} -->
                </table>
              </td>
            </tr>

            <!-- QR Code + Link -->
            <tr>
              <td style="padding: 8px 24px 24px 24px">
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="border: 1px dashed #e5e7eb; border-radius: 12px"
                >
                  <tr>
                    <td style="padding: 18px 16px; text-align: center">
                      <div
                        style="
                          font-family:
                            Inter,
                            Segoe UI,
                            Arial,
                            sans-serif;
                          font-size: 14px;
                          color: #374151;
                          margin-bottom: 10px;
                        "
                      >
                        Dein QR-Code für den Check-in
                      </div>
                      <!-- Variante A: Backend generiert QR und liefert als URL oder Base64 -->
                      <img
                        src="{{event.qrCodeSrc}}"
                        alt="QR Code zum Ticket"
                        width="160"
                        height="160"
                        style="
                          display: block;
                          margin: 0 auto;
                          border-radius: 8px;
                          border: 1px solid #eef0f3;
                          outline: none;
                          text-decoration: none;
                        "
                      />
                      <div
                        style="
                          font-family:
                            Inter,
                            Segoe UI,
                            Arial,
                            sans-serif;
                          font-size: 12px;
                          color: #6b7280;
                          margin-top: 10px;
                          word-break: break-all;
                        "
                      >
                        <a
                          href="https://event-scanner.com/event/{{event.id}}"
                          style="color: #2563eb; text-decoration: none"
                        >
                          https://event-scanner.com/event/{{event.id}}
                        </a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Textblock -->
            <tr>
              <td style="padding: 0 24px 20px 24px">
                <p
                  style="
                    margin: 0;
                    font-family:
                      Inter,
                      Segoe UI,
                      Arial,
                      sans-serif;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #374151;
                  "
                >
                  Du hast dich erfolgreich für
                  <strong style="color: #111827">{{event.title}}</strong>
                  registriert. Bitte bringe diesen QR-Code (digital oder
                  ausgedruckt) zum Check-in mit.
                </p>
              </td>
            </tr>

            <!-- Footer / Rechtliches -->
            <tr>
              <td style="height: 1px; background: #eef0f3"></td>
            </tr>
            <tr>
              <td style="padding: 16px 24px 24px 24px">
                <p
                  style="
                    margin: 0;
                    font-family:
                      Inter,
                      Segoe UI,
                      Arial,
                      sans-serif;
                    font-size: 12px;
                    line-height: 1.6;
                    color: #6b7280;
                  "
                >
                  Rechtlicher Hinweis: Diese E-Mail ist eine Bestätigung deiner
                  Registrierung. Mit der Registrierung akzeptierst du die
                  <a
                    href="{{event.termsUrl}}"
                    style="color: #2563eb; text-decoration: none"
                    >AGB</a
                  >
                  und unsere
                  <a
                    href="{{event.privacyUrl}}"
                    style="color: #2563eb; text-decoration: none"
                    >Datenschutzhinweise</a
                  >
                  des Veranstalters. Solltest du diese Registrierung nicht
                  vorgenommen haben, wende dich bitte umgehend an
                  <a
                    href="mailto:{{event.supportEmail}}"
                    style="color: #2563eb; text-decoration: none"
                    >{{event.supportEmail}}</a
                  >.
                </p>
              </td>
            </tr>
          </table>
          <!-- /Card -->

          <!-- Fallback Footer -->
          <div
            style="
              font-family:
                Inter,
                Segoe UI,
                Arial,
                sans-serif;
              font-size: 11px;
              color: #9ca3af;
              margin-top: 16px;
              text-align: center;
            "
          >
            © {{event.year}} {{event.organizerName}}
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>

  `;
  };
}
