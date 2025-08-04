// tickets.service.ts
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Event } from 'src/core/domain/event';
import { Ticket } from 'src/core/domain/ticket';
import { MongoEventRepository } from 'src/infrastructure/repositories/mongodb/event.repository';
import { MongoTicketRepository } from 'src/infrastructure/repositories/mongodb/ticket.repository';
import { CreateTicketDto } from 'src/presentation/dtos/create-ticket.dto';
import { v4 as uuidv4 } from 'uuid';
(global as any).crypto = 'crypto';

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
        
        <!-- Miniaturkarte -->
        <div class="map-container">
      <a href="https://www.google.com/maps/dir/?api=1&destination={{event.location.coordinates.latitude}},{{event.location.coordinates.longitude}}" target="_blank">
  <img src="https://staticmap.openstreetmap.de/staticmap.php?center={{event.location.coordinates.latitude}},{{event.location.coordinates.longitude}}&zoom=14&size=300x200&markers={{event.location.coordinates.latitude}},{{event.location.coordinates.longitude}},red-pushpin" 
       alt="Karte zum Zielort" 
       style="border:0; max-width:100%; height:auto;">
</a>

        <div class="ticket-info">
          <p><strong>Ticket ID:</strong> {{ticket.ticketId}}</p>
          <p><strong>E-Mail:</strong> {{ticket.email}}</p>
        </div>

        <!-- QR Code -->
        <div class="qr-section">
          <div class="qr-code">
            <canvas id="qr"></canvas>
          </div>
          <a class="view-ticket-btn" href="https://event-scanner.com/ticket/xIHOsRyQ8s">
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
          imageUrl: event?.imageUrl || 'https://via.placeholder.com/400x200',
          ticketLink: `${process.env.FRONTEND_URL || 'https://event-scanner.com/'}/ticket/${ticket.ticketId}`,
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

  async getTicketAndEvent(
    ticketId: string,
    eventId: string,
  ): Promise<{ ticket: Ticket; event: Event }> {
    const ticket = await this.ticketRepository.findTicketId(ticketId);
    const event = await this.eventRepository.findById(eventId);
    return { ticket, event };
  }
}
