// tickets.service.ts
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { nanoid } from 'nanoid';
import { Ticket } from 'src/core/domain/ticket';
import { MongoEventRepository } from 'src/infrastructure/repositories/mongodb/event.repository';
import { MongoTicketRepository } from 'src/infrastructure/repositories/mongodb/ticket.repository';
import { CreateTicketDto } from 'src/presentation/dtos/create-ticket.dto';

const SECRET = 'mySuperSecretKey';

@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketRepository: MongoTicketRepository,
    private readonly eventRepository: MongoEventRepository,
    private readonly mailerService: MailerService,
  ) {}

  generateTicketHash(ticketUid: string, email: string): string {
    return crypto
      .createHash('sha256')
      .update(`${ticketUid}:${email}:${SECRET}`)
      .digest('hex');
  }

  private getTicketTemplate(): string {
    return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <title>Event Ticket</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

      body {
        font-family: 'Inter', sans-serif;
        background: black;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        margin: 0;
      }

      .ticket {
        background: #fff;
        max-width: 420px;
        width: 100%;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        background: #000;
        color: #fff;
      }

      .header img {
        height: 28px;
      }

      .event-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }

      .content {
        padding: 16px;
      }

      .event-title {
        font-size: 1.4rem;
        font-weight: 600;
        margin: 0 0 4px;
      }

      .event-date {
        color: #555;
        font-size: 0.9rem;
        margin-bottom: 8px;
      }

      .event-location {
        font-size: 0.95rem;
        margin-bottom: 12px;
      }

      .map {
        width: 100%;
        height: 180px;
        border-radius: 8px;
        margin-bottom: 12px;
      }

      .ticket-info {
        background: #fafafa;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        border: 1px solid #eee;
      }

      .ticket-info p {
        margin: 4px 0;
        font-size: 0.95rem;
      }

      .qr-section {
        text-align: center;
        margin: 16px 0;
      }

      .ticket-link {
        display: block;
        text-align: center;
        color: #3b82f6;
        text-decoration: none;
        font-weight: 500;
        margin-top: 8px;
      }
    </style>
  </head>
  <body>
    <div class="ticket">
      <div class="header">
        <span>Event Ticket</span>
        <img
          src="https://event-scanner.com/logo.png"
          alt="Event Scanner Logo"
        />
      </div>

      <!-- Event Image -->
      <img class="event-image" src="{{event.imageUrl}}" alt="{{event.title}}" />

      <div class="content">
        <h2 class="event-title">{{event.title}}</h2>
        <p class="event-date">{{event.startDate}} um {{event.startTime}}</p>
        <p class="event-location">{{event.city}}</p>

        <!-- Optional Map -->
        <iframe
          class="map"
          loading="lazy"
          allowfullscreen
          referrerpolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q={{event.location.coordinates.lat}},{{event.location.coordinates.lon}}&hl=de;z=14&output=embed"
        >
        </iframe>
        {{/if}}

        <div class="ticket-info">
          <p><strong>Ticket ID:</strong> {{ticket.ticketId}}</p>
          <p><strong>Email:</strong> {{ticket.email}}</p>
          <p><strong>Status:</strong> {{ticket.status}}</p>
          <p><strong>Erstellt:</strong> {{ticket.createdAt}}</p>
        </div>

        <!-- QR Code -->
        <div class="qr-section">
          <canvas id="qr"></canvas>
          <a class="ticket-link" href="{{ticket.ticketLink}}" target="_blank"
            >Ticket öffnen</a
          >
        </div>
      </div>
    </div>

    <!-- QRious for QR Code Generation -->
    <script src="https://cdn.jsdelivr.net/npm/qrious/dist/qrious.min.js"></script>
    <script>
      const ticketHash = '{{ticket.hash}}'; // dynamically inserted
      const qr = new QRious({
        element: document.getElementById('qr'),
        value: ticketHash,
        size: 140,
        background: '#fff',
        foreground: '#000',
      });
    </script>
  </body>
</html>`;
  }

  private replaceTemplateVariables(template: string, data: any): string {
    let result = template;

    // Ersetze alle {{variable}} mit den entsprechenden Werten
    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, data[key]);
    });

    // Ersetze verschachtelte Objekte wie {{event.title}}
    if (data.event) {
      Object.keys(data.event).forEach((key) => {
        const regex = new RegExp(`{{event.${key}}}`, 'g');
        result = result.replace(regex, data.event[key]);
      });
    }

    if (data.ticket) {
      Object.keys(data.ticket).forEach((key) => {
        const regex = new RegExp(`{{ticket.${key}}}`, 'g');
        result = result.replace(regex, data.ticket[key]);
      });
    }

    return result;
  }

  async addGuest(dto: CreateTicketDto): Promise<Ticket> {
    const ticketId = nanoid(10);
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
          imageUrl: event?.imageUrl || 'https://via.placeholder.com/400x200',
          ticketLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/ticket/${ticket.ticketId}`,
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
        subject: `Ticket für ${event?.title || 'Event'} - ${ticket.ticketId}`,
        text: `Ihr Ticket wurde erstellt. Ihre Ticket-ID ist: ${ticket.ticketId}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
    }
    return ticket;
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
}
