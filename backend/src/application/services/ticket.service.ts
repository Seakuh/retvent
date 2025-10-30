// tickets.service.ts
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Event } from 'src/core/domain/event';
import { Ticket } from 'src/core/domain/ticket';
import { MongoEventRepository } from 'src/infrastructure/repositories/mongodb/event.repository';
import { MongoTicketRepository } from 'src/infrastructure/repositories/mongodb/ticket.repository';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { CreateTicketDto } from 'src/presentation/dtos/create-ticket.dto';
import { InviteTicketDto } from 'src/presentation/dtos/invite-guest.dto';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from './user.service';

const SECRET = 'mySuperSecretKey';

@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketRepository: MongoTicketRepository,
    private readonly eventRepository: MongoEventRepository,
    private readonly mailerService: MailerService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  private simpleHash(input: string): string {
    let hash = 0;
    if (input.length === 0) return hash.toString();

    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to positive hex string
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  generateTicketHash(ticketUid: string, email: string): string {
    const combined = `${ticketUid}:${email}:${SECRET}`;
    return this.simpleHash(combined);
  }

  private replaceTemplateVariables(template: string, data: any): string {
    let result = template;

    // Helper function to replace nested object properties
    const replaceNestedProperties = (obj: any, prefix: string = '') => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // Recursively handle nested objects
          replaceNestedProperties(value, fullKey);
        } else {
          // Replace the template variable with the value
          const regex = new RegExp(`{{${fullKey}}}`, 'g');
          result = result.replace(regex, String(value));
        }
      });
    };

    replaceNestedProperties(data);

    return result;
  }

  async addGuest(dto: CreateTicketDto): Promise<Ticket> {
    const ticketId = uuidv4();
    const hash = this.generateTicketHash(ticketId, dto.email);
    const ticket = await this.ticketRepository.create({
      eventId: dto.eventId,
      email: dto.email,
      ticketId: ticketId,
      status: 'pending',
      createdAt: new Date(),
      hash: hash,
    });

    try {
      // Event-Daten abrufen
      const event = await this.eventRepository.findById(dto.eventId);

      // Template laden und Variablen ersetzen
      const template = this.getTicketTemplate();
      const htmlContent = this.replaceTemplateVariables(template, {
        event: {
          title: event?.title || 'Event',
          startDate: event?.startDate
            ? new Date(event.startDate).toLocaleDateString('de-DE')
            : 'TBD',
          startTime: event?.startTime || 'TBD',
          imageUrl: event?.imageUrl || 'https://event-scanner.com/logo.png',
          ticketLink: `${process.env.FRONTEND_URL || 'https://event-scanner.com'}/ticket/${ticket.ticketId}`,
          city: event?.city || 'TBD',
        },
        ticket: {
          ticketId: ticket.ticketId,
          email: ticket.email,
          status: ticket.status,
          createdAt: ticket.createdAt.toLocaleDateString('de-DE'),
          hash: ticket.hash,
        },
      });

      await this.mailerService.sendMail({
        to: dto.email,
        subject: `🎫 Dein Ticket für ${event?.title || 'Event'} - ${ticket.ticketId}`,

        text: `Deine Einladung wurde erstellt. Deine Einladung-ID ist: ${ticket.ticketId}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
    }
    return ticket;
  }

  /**
   * Invites a guest to an event by creating a ticket and sending an invitation email.
   * If the user doesn't exist, creates a new account with a generated password.
   */
  async inviteGuest(dto: InviteTicketDto): Promise<Ticket> {
    // Validate ticket doesn't already exist
    await this.validateUniqueTicket(dto.email, dto.eventId);

    // Get event details
    const event = await this.getEventOrThrow(dto.eventId);

    // Check if user exists, create if not
    const generatedPassword = await this.ensureUserExists(dto.email);

    // Create ticket
    const ticket = await this.createTicket(dto.eventId, dto.email);

    // Send invitation email (with password if user was just created)
    await this.sendInvitationEmail(ticket, event, generatedPassword);

    return ticket;
  }

  private async validateUniqueTicket(
    email: string,
    eventId: string,
  ): Promise<void> {
    const existingTicket = await this.ticketRepository.findByEmailAndEventId(
      email,
      eventId,
    );

    if (existingTicket) {
      throw new BadRequestException(
        `Ein Ticket für ${email} und dieses Event existiert bereits. Status: ${existingTicket.status}`,
      );
    }
  }

  private async getEventOrThrow(eventId: string): Promise<Event> {
    // Validate ObjectId format before querying
    if (!this.isValidObjectId(eventId)) {
      throw new BadRequestException(
        `Invalid event ID format: ${eventId}. Event ID must be a valid MongoDB ObjectId.`,
      );
    }

    try {
      const event = await this.eventRepository.findById(eventId);

      if (!event) {
        throw new BadRequestException(`Event with ID ${eventId} not found`);
      }

      return event;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to retrieve event: ${error.message}`,
      );
    }
  }

  private isValidObjectId(id: string): boolean {
    // MongoDB ObjectId is a 24-character hex string
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * Ensures a user exists for the given email.
   * If user doesn't exist, creates a new one with a generated password.
   * @returns The generated password if a new user was created, null otherwise
   */
  private async ensureUserExists(email: string): Promise<string | null> {
    try {
      const existingUser = await this.userService.findByEmail(email);

      if (existingUser) {
        return null; // User already exists, no password to send
      }

      const generatedPassword = this.generateSecurePassword();
      const username = this.generateUsernameFromEmail(email);

      await this.authService.registerWithProfile({
        email,
        password: generatedPassword,
        username,
      });

      return generatedPassword;
    } catch (error) {
      // If user creation fails (e.g., duplicate username), handle gracefully
      if (error.message?.includes('already exists')) {
        // User was created between our check and registration attempt
        return null;
      }
      throw new BadRequestException(
        `Failed to create user account: ${error.message}`,
      );
    }
  }

  private generateSecurePassword(): string {
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }

  private generateUsernameFromEmail(email: string): string {
    const baseUsername = email.split('@')[0];
    // Add random suffix to ensure uniqueness
    const randomSuffix = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');
    return `${baseUsername}_${randomSuffix}`;
  }

  private async createTicket(eventId: string, email: string): Promise<Ticket> {
    const ticketId = uuidv4();
    const hash = this.generateTicketHash(ticketId, email);

    return this.ticketRepository.create({
      eventId,
      email,
      ticketId,
      status: 'pending',
      createdAt: new Date(),
      hash,
    });
  }

  private async sendInvitationEmail(
    ticket: Ticket,
    event: Event,
    generatedPassword: string | null,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'https://event-scanner.com';

    const templateData = {
      event: {
        title: event.title || 'Event',
        startDate: event.startDate
          ? new Date(event.startDate).toLocaleDateString('de-DE')
          : 'TBD',
        startTime: event.startTime || 'TBD',
        imageUrl: event.imageUrl || 'https://event-scanner.com/logo.png',
        ticketLink: `${frontendUrl}/ticket/${ticket.ticketId}`,
        city: event.city || 'TBD',
      },
      ticket: {
        ticketId: ticket.ticketId,
        email: ticket.email,
        status: ticket.status,
        createdAt: ticket.createdAt.toLocaleDateString('de-DE'),
        hash: ticket.hash,
      },
      credentials: {
        section: generatedPassword
          ? this.buildCredentialsSection(ticket.email, generatedPassword)
          : '',
      },
    };

    const template = this.getInviteTemplate();
    const htmlContent = this.replaceTemplateVariables(template, templateData);

    try {
      await this.mailerService.sendMail({
        to: ticket.email,
        subject: `🎫 Deine Einladung für ${event.title}`,
        text: this.buildPlainTextInvitation(ticket, event, generatedPassword),
        html: htmlContent,
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to send invitation email: ${error.message}`,
      );
    }
  }

  private buildCredentialsSection(email: string, password: string): string {
    return `
      <div class="credentials-section">
        <h3 style="color: #004d5c; font-size: 18px; margin-top: 25px; margin-bottom: 15px;">
          🔐 Deine Zugangsdaten
        </h3>
        <div style="background-color: #fff4e6; border-left: 4px solid #ff9800; padding: 15px 20px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 8px 0; font-size: 15px;"><strong>E-Mail:</strong> ${email}</p>
          <p style="margin: 8px 0; font-size: 15px;"><strong>Passwort:</strong> <code style="background-color: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 14px;">${password}</code></p>
        </div>
        <p style="margin-top: 15px; font-size: 14px; color: #d32f2f; font-weight: 500;">
          ⚠️ Wichtig: Bitte ändere dein Passwort nach dem ersten Login!
        </p>
      </div>
    `;
  }

  private buildPlainTextInvitation(
    ticket: Ticket,
    event: Event,
    generatedPassword: string | null,
  ): string {
    let text = `Deine Einladung für ${event.title} wurde erstellt.\n\n`;
    text += `Einladungs-ID: ${ticket.ticketId}\n\n`;

    if (generatedPassword) {
      text += `Ein Konto wurde für dich erstellt:\n`;
      text += `Email: ${ticket.email}\n`;
      text += `Passwort: ${generatedPassword}\n\n`;
      text += `Bitte ändere dein Passwort nach dem ersten Login.\n\n`;
    }

    text += `Bitte bestätige deine Teilnahme über den Link in der Email.\n`;

    return text;
  }

  async validateTicket(
    ticketId: string,
    providedHash: string,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findTicketId(ticketId);
    if (!ticket) {
      throw new Error('Ticket nicht gefunden');
    }

    if (ticket.status === 'validated') {
      throw new Error('Ticket bereits validiert');
    }

    const hash = this.generateTicketHash(ticket.ticketId, ticket.email);
    if (hash !== providedHash) {
      throw new Error('Ungültige Hash-Prüfung');
    }

    ticket.status = 'validated';
    await this.ticketRepository.update(ticketId, ticket);
    return ticket;
  }

  async getTicketByIds(ticketIds: string[]): Promise<any> {
    console.log('ticketIds', ticketIds);
    const tickets = await this.ticketRepository.findTicketsIds(ticketIds);
    console.log('tickets', tickets);
    const events = await this.eventRepository.getUserFavorites(
      tickets.map((ticket) => ticket.eventId),
    );
    console.log('events', events);
    const eventMap = new Map(events.map((event) => [event.id, event]));

    return tickets.map((ticket) => ({
      ticketId: ticket.ticketId,
      email: ticket.email,
      status: ticket.status,
      createdAt: ticket.createdAt,
      hash: ticket.hash,
      event: eventMap.get(ticket.eventId),
    }));
  }

  async getTicketsForEvent(eventId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({ eventId });
  }

  async getTicketById(ticketId: string): Promise<Ticket> {
    return this.ticketRepository.findTicketId(ticketId);
  }

  async updateTicket(ticketId: string, ticket: Ticket): Promise<Ticket> {
    return this.ticketRepository.update(ticketId, ticket);
  }

  async deleteTicket(ticketId: string): Promise<boolean> {
    return this.ticketRepository.delete(ticketId);
  }
  async getInviteGuestsByEventId(eventId: string): Promise<Ticket[]> {
    return this.ticketRepository.getInviteGuestsByEventId(eventId);
  }

  async getTicketAndEvent(
    ticketId: string,
    eventId: string,
  ): Promise<{ ticket: Ticket; event: Event }> {
    const ticket = await this.ticketRepository.findTicketId(ticketId);
    const event = await this.eventRepository.findById(eventId);
    return { ticket, event };
  }

  // =====================================================
  // NEW ENDPOINTS: Ticket Activation & QR Code Scanning
  // =====================================================

  /**
   * Activates a ticket after a guest accepts their invitation.
   * Changes status from 'pending' to 'active'.
   *
   * @param ticketId - The unique ticket identifier
   * @param email - The guest's email address
   * @param providedHash - The hash from the invitation (for verification)
   * @returns The activated ticket
   * @throws BadRequestException if validation fails
   */
  async activateTicket(
    ticketId: string,
    email: string,
    providedHash: string,
  ): Promise<{
    ticket: Ticket;
    message: string;
  }> {
    // Find the ticket
    const ticket = await this.ticketRepository.findTicketId(ticketId);

    if (!ticket) {
      throw new BadRequestException(
        `Ticket with ID ${ticketId} not found`,
      );
    }

    // Verify the email matches
    if (ticket.email !== email) {
      throw new BadRequestException(
        'Email does not match the ticket email',
      );
    }

    // Verify the hash
    const expectedHash = this.generateTicketHash(ticket.ticketId, ticket.email);
    if (expectedHash !== providedHash) {
      throw new BadRequestException(
        'Invalid ticket hash. The ticket could not be verified.',
      );
    }

    // Check current status
    if (ticket.status === 'active') {
      return {
        ticket,
        message: 'Ticket is already active',
      };
    }

    if (ticket.status === 'validated') {
      throw new BadRequestException(
        'Ticket has already been used and cannot be activated again',
      );
    }

    // Activate the ticket
    ticket.status = 'active';
    const updatedTicket = await this.ticketRepository.update(ticketId, ticket);

    return {
      ticket: updatedTicket,
      message: 'Ticket successfully activated',
    };
  }

  /**
   * Scans and validates a ticket at the event entrance using QR code.
   * Changes status from 'active' to 'validated'.
   *
   * This endpoint is typically used by event staff with a QR code scanner.
   * Only event organizers and designated validators can scan tickets.
   *
   * @param ticketId - The unique ticket identifier (from QR code)
   * @param providedHash - The hash from the QR code (for verification)
   * @param scannerId - The user ID of the person scanning (organizer or validator)
   * @returns The validated ticket with event details
   * @throws BadRequestException if validation fails or user is not authorized
   */
  async scanTicketAtEntrance(
    ticketId: string,
    providedHash: string,
    scannerId?: string,
  ): Promise<{
    ticket: Ticket;
    event: Event;
    message: string;
    guestName: string;
  }> {
    // Find the ticket
    const ticket = await this.ticketRepository.findTicketId(ticketId);

    if (!ticket) {
      throw new BadRequestException(
        `Ticket with ID ${ticketId} not found`,
      );
    }

    // Verify the hash
    const expectedHash = this.generateTicketHash(ticket.ticketId, ticket.email);
    if (expectedHash !== providedHash) {
      throw new BadRequestException(
        'Invalid QR code. The ticket could not be verified.',
      );
    }

    // Get event details first to check permissions
    const event = await this.eventRepository.findById(ticket.eventId);

    if (!event) {
      throw new BadRequestException(
        `Event with ID ${ticket.eventId} not found`,
      );
    }

    // Check scanner permissions (must be event organizer or validator)
    if (scannerId) {
      const isOrganizer = event.hostId === scannerId;
      const isValidator = event.validators?.includes(scannerId) ?? false;

      if (!isOrganizer && !isValidator) {
        throw new BadRequestException(
          'You are not authorized to scan tickets for this event',
        );
      }
    }

    // Check if ticket is already validated
    if (ticket.status === 'validated') {
      return {
        ticket,
        event,
        message: 'Ticket has already been scanned and validated',
        guestName: ticket.email,
      };
    }

    // Check if ticket is not yet activated
    if (ticket.status === 'pending') {
      throw new BadRequestException(
        'Ticket has not been activated yet. Guest must accept the invitation first.',
      );
    }

    // Validate the ticket
    ticket.status = 'validated';
    ticket.validatedAt = new Date();
    const updatedTicket = await this.ticketRepository.update(ticketId, ticket);

    return {
      ticket: updatedTicket,
      event,
      message: 'Ticket successfully validated. Guest may enter.',
      guestName: ticket.email,
    };
  }

  /**
   * Approves a pending registration and sends confirmation email.
   * Changes status from 'pending' to 'active'.
   *
   * @param ticketId - The ticket ID to approve
   * @returns The approved ticket with success message
   * @throws BadRequestException if ticket not found or not pending
   */
  async approveRegistration(ticketId: string): Promise<{
    ticket: Ticket;
    message: string;
  }> {
    const ticket = await this.ticketRepository.findTicketId(ticketId);

    if (!ticket) {
      throw new BadRequestException(`Ticket with ID ${ticketId} not found`);
    }

    if (ticket.status !== 'pending') {
      throw new BadRequestException(
        `Ticket is not pending. Current status: ${ticket.status}`,
      );
    }

    // Update ticket status
    ticket.status = 'active';
    const updatedTicket = await this.ticketRepository.update(ticketId, ticket);

    // Get event details for email
    const event = await this.eventRepository.findById(ticket.eventId);

    if (event) {
      // Send approval email
      await this.sendApprovalEmail(ticket, event);
    }

    return {
      ticket: updatedTicket,
      message: 'Registration approved successfully',
    };
  }

  /**
   * Rejects a pending registration and sends rejection email.
   * Deletes the ticket from the database.
   *
   * @param ticketId - The ticket ID to reject
   * @returns Success message
   * @throws BadRequestException if ticket not found or not pending
   */
  async rejectRegistration(ticketId: string): Promise<{
    message: string;
  }> {
    const ticket = await this.ticketRepository.findTicketId(ticketId);

    if (!ticket) {
      throw new BadRequestException(`Ticket with ID ${ticketId} not found`);
    }

    if (ticket.status !== 'pending') {
      throw new BadRequestException(
        `Ticket is not pending. Current status: ${ticket.status}`,
      );
    }

    // Get event details for email
    const event = await this.eventRepository.findById(ticket.eventId);

    if (event) {
      // Send rejection email
      await this.sendRejectionEmail(ticket, event);
    }

    // Delete the ticket
    await this.ticketRepository.delete(ticketId);

    return {
      message: 'Registration rejected successfully',
    };
  }

  private async sendApprovalEmail(ticket: Ticket, event: Event): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'https://event-scanner.com';

    const templateData = {
      event: {
        title: event.title || 'Event',
        startDate: event.startDate
          ? new Date(event.startDate).toLocaleDateString('de-DE')
          : 'TBD',
        startTime: event.startTime || 'TBD',
        imageUrl: event.imageUrl || 'https://event-scanner.com/logo.png',
        ticketLink: `${frontendUrl}/ticket/${ticket.ticketId}`,
        city: event.city || 'TBD',
      },
      ticket: {
        ticketId: ticket.ticketId,
        email: ticket.email,
        hash: ticket.hash,
      },
    };

    const htmlContent = `
      <!doctype html>
      <html lang="de">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Registrierung genehmigt</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Registrierung genehmigt!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #004d5c; font-size: 22px; margin-top: 0;">${templateData.event.title}</h2>
                      <p style="color: #333; font-size: 16px; line-height: 1.6;">
                        Deine Registrierung wurde genehmigt! Du kannst nun am Event teilnehmen.
                      </p>
                      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 8px 0;"><strong>📅 Datum:</strong> ${templateData.event.startDate}</p>
                        <p style="margin: 8px 0;"><strong>🕐 Uhrzeit:</strong> ${templateData.event.startTime}</p>
                        <p style="margin: 8px 0;"><strong>📍 Ort:</strong> ${templateData.event.city}</p>
                      </div>
                      <div style="background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #1976D2;"><strong>Dein Bestätigungscode:</strong></p>
                        <p style="margin: 10px 0; font-size: 18px; font-family: monospace; color: #1976D2; font-weight: bold;">${templateData.ticket.hash}</p>
                      </div>
                      <a href="${templateData.event.ticketLink}" style="display: inline-block; background-color: #4CAF50; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0;">
                        Ticket anzeigen
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      await this.mailerService.sendMail({
        to: ticket.email,
        subject: `✅ Registrierung genehmigt - ${event.title}`,
        text: `Deine Registrierung für ${event.title} wurde genehmigt. Bestätigungscode: ${ticket.hash}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send approval email:', error);
    }
  }

  private async sendRejectionEmail(ticket: Ticket, event: Event): Promise<void> {
    const htmlContent = `
      <!doctype html>
      <html lang="de">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Registrierung abgelehnt</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Registrierung abgelehnt</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #004d5c; font-size: 22px; margin-top: 0;">${event.title || 'Event'}</h2>
                      <p style="color: #333; font-size: 16px; line-height: 1.6;">
                        Leider wurde deine Registrierung für dieses Event nicht genehmigt.
                      </p>
                      <p style="color: #666; font-size: 14px; line-height: 1.6;">
                        Bei Fragen wende dich bitte an den Event-Organisator.
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

    try {
      await this.mailerService.sendMail({
        to: ticket.email,
        subject: `Registrierung abgelehnt - ${event.title || 'Event'}`,
        text: `Deine Registrierung für ${event.title || 'Event'} wurde leider abgelehnt.`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send rejection email:', error);
    }
  }

  private getTicketTemplate(): string {
    return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <title>Event Ticket</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        background: #f5f5f7;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        margin: 0;
        min-height: 100vh;
      }

      .ticket {
        background: #fff;
        max-width: 375px;
        width: 100%;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        position: relative;
      }

      .event-image {
        width: 100%;
        height: 180px;
        object-fit: cover;
        border-radius: 20px 20px 0 0;
      }

      .content {
        padding: 24px;
      }

      .event-title {
        font-size: 22px;
        font-weight: 600;
        color: #1d1d1f;
        margin: 0 0 6px 0;
        line-height: 1.2;
      }

      .event-date {
        color: #86868b;
        font-size: 16px;
        margin-bottom: 4px;
        font-weight: 400;
      }

      .event-location {
        color: #1d1d1f;
        font-size: 16px;
        margin-bottom: 20px;
        font-weight: 400;
      }

      .map-container {
        margin-bottom: 24px;
      }

      .map-link {
        text-decoration: none;
        color: inherit;
        display: block;
      }

      .mini-map {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      }

      .mini-map:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .map-thumbnail {
        width: 100%;
        height: 100px;
        object-fit: cover;
        display: block;
      }

      .map-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;
        backdrop-filter: blur(4px);
      }

      .mini-map:hover .map-overlay {
        opacity: 1;
      }

      .route-text {
        color: white;
        font-weight: 600;
        font-size: 14px;
        background: rgba(0, 122, 255, 0.9);
        padding: 8px 16px;
        border-radius: 20px;
        backdrop-filter: blur(10px);
      }

      .ticket-info {
        background: #f9f9f9ec;
        padding: 16px;
        border-radius: 12px;
        margin-bottom: 24px;
        border: none;
        backdrop-filter: blur(10px);
      }

      .ticket-info p {
        margin: 8px 0;
        font-size: 14px;
        color: #1d1d1f;
      }

      .ticket-info strong {
        color: #86868b;
        font-weight: 500;
      }

      .qr-section {
        text-align: center;
        margin-bottom: 20px;
      }

      .qr-code {  
        padding: 16px;
        background: #fff;
        border-radius: 12px;
        display: inline-block;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        margin-bottom: 16px;
      }

      .view-ticket-btn {
        display: inline-block;
        color: white;
        background: #007aff;
        color: white;
        text-decoration: none;
        font-weight: 600;
        font-size: 16px;
        padding: 14px 28px;
        border-radius: 25px;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
      }

      .view-ticket-btn:hover {
        background: #0056d3;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
      }

      .view-ticket-btn:active {
        transform: translateY(0);
      }

      /* Perforated edge effect */
      .ticket::before {
        content: '';
        position: absolute;
        top: 200px;
        left: -10px;
        right: -10px;
        height: 20px;
        background: radial-gradient(circle at 10px 10px, transparent 5px, #f5f5f7 5px);
        background-size: 20px 20px;
        z-index: 1;
      }
    </style>
  </head>
  <body>
    <div class="ticket">
      <!-- Event Image -->
      <img class="event-image" src="{{event.imageUrl}}" alt="{{event.title}}" />

      <div class="content">
        <h1 class="event-title">{{event.title}}</h1>
        <p class="event-date">{{event.startDate}} um {{event.startTime}}</p>
        

        <div class="ticket-info">
          <p><strong>Ticket ID:</strong> {{ticket.ticketId}}</p>
          <p><strong>E-Mail:</strong> {{ticket.email}}</p>
        </div>

        <!-- QR Code -->
        <div class="qr-section">
          <div class="qr-code">
            <canvas id="qr"></canvas>
          </div>
          <a class="view-ticket-btn" href="{{event.ticketLink}}">
            Ticket anzeigen
          </a>
        </div>
      </div>
    </div>

    <!-- QRious for QR Code Generation -->
    <script src="https://cdn.jsdelivr.net/npm/qrious/dist/qrious.min.js"></script>
    <script>
      const ticketHash = '{{ticket.hash}}';
      const qr = new QRious({
        element: document.getElementById('qr'),
        value: ticketHash,
        size: 120,
        background: '#fff',
        foreground: '#1d1d1f',
      });
    </script>
  </body>
</html>`;
  }

  private getInviteTemplate(): string {
    return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>♥️♠️♦️♣️ Einladung zu {{event.title}}</title>
    <style>
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        background-color: #f7f9fa;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 107, 128, 0.15);
        overflow: hidden;
      }
      .header {
        background-color: #006b80;
        color: #ffffff;
        text-align: center;
        padding: 30px 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 26px;
        letter-spacing: 0.5px;
      }
      .content {
        padding: 30px 40px;
      }
      .content h2 {
        color: #004d5c;
        margin-top: 0;
        font-size: 22px;
      }
      .content p {
        line-height: 1.6;
        font-size: 16px;
        color: #333;
      }
      .event-details {
        background-color: #f0fafa;
        border-left: 4px solid #00a8c6;
        padding: 15px 20px;
        border-radius: 8px;
        margin: 20px 0;
      }

      .event-image {
        width: 100%;
        height: 180px;
        object-fit: cover;
        border-radius: 20px 20px 0 0;
      }
      .button {
        display: inline-block;
        background-color: #008da3;
        color: #ffffff !important;
        padding: 12px 28px;
        border-radius: 30px;
        text-decoration: none;
        font-weight: 600;
        margin-top: 20px;
        transition: background-color 0.3s ease;
      }
      .button:hover {
        background-color: #004d5c;
      }
      .footer {
        background-color: #f7f9fa;
        color: #999999;
        font-size: 13px;
        text-align: center;
        padding: 20px;
      }
    </style>
  </head>

  <body>
    <div class="container">
    <img class="event-image" src="{{event.imageUrl}}" alt="{{event.title}}" />
      <div class="header">
        <h1>Einladung zu {{event.title}}</h1>
      </div>
      <div class="content">
        <h2>Liebe/r {{ticket.email}},</h2>
        <p>
          wir freuen uns sehr, dich herzlich zu unserem Event
          <strong>{{event.title}}</strong> einzuladen!
        </p>
        <div class="event-details">
          <p><strong>Datum:</strong> {{event.startDate}}</p>
          <p><strong>Uhrzeit:</strong> {{event.startTime}}</p>
          <p><strong>Ort:</strong> {{event.city}}</p>
        </div>

        {{credentials.section}}

        <p>
          Bitte bestätige deine Teilnahme, damit wir dich auf der Gästeliste
          vermerken können.
        </p>
        <a href="{{event.ticketLink}}" class="button">Jetzt Teilnahme bestätigen</a>
        <p style="margin-top: 25px">
          Wir freuen uns darauf, dich bald zu sehen und gemeinsam einen
          unvergesslichen Abend zu erleben!
        </p>
      </div>
      <div class="footer">
        <p>
          Diese Nachricht wurde automatisch gesendet – bitte antworte nicht
          direkt auf diese E-Mail.
        </p>
      </div>
              <!-- QR Code -->
        <div class="qr-section">
          <div class="qr-code">
            <canvas id="qr"></canvas>
          </div>
          <a class="view-ticket-btn" href="{{event.ticketLink}}">
            Ticket anzeigen
          </a>
        </div>
      </div>
    </div>

    <!-- QRious for QR Code Generation -->
    <script src="https://cdn.jsdelivr.net/npm/qrious/dist/qrious.min.js"></script>
    <script>
      const ticketHash = '{{ticket.hash}}';
      const qr = new QRious({
        element: document.getElementById('qr'),
        value: ticketHash,
        size: 120,
        background: '#fff',
        foreground: '#1d1d1f',
      });
    </script>
  </body>
</html>
`;
  }
}
