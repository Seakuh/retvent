// src/infrastructure/services/chatgpt.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { z } from 'zod';
import { Event } from '../../core/domain/event';

// Definiere ein Schema für die API-Validierung
const EventResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  startDate: z.string(),
  startTime: z.string(),
  hostId: z.string(),
  locationId: z.string().optional(),
  category: z.string().optional(),
  price: z.number().optional(),
  ticketLink: z.string().optional(),
});

@Injectable()
export class ChatGPTService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_API_KEY,
    });
  }

  async generateEventFromText(text: string): Promise<Partial<Event>> {
    // Mock-Event mit der neuen Struktur
    const mockEvent: Partial<Event> = {
      title: 'Event Name',
      description: 'Event Description',
      startDate: new Date(),
      startTime: '18:00',
      locationId: '1',
    };

    return mockEvent;
  }

  extractEventFromFlyer = async (
    imageUrl: string,
  ): Promise<Partial<Event> | null> => {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Lies den Inhalt dieses Event-Flyers und extrahiere die wichtigsten Informationen. Interpretiere die Beschreibung, um sinnvolle Details in das Event-Objekt einzufügen.

**Extraktionsregeln:**
- Extrahiere folgende Informationen:
  - **Titel (title)**: Name des Events
  - **Beschreibung (description)**: Zusammenfassung, die den Flyer-Text interpretiert und wesentliche Informationen zusammenfasst
  - **Startdatum (startDate)**: Im Format YYYY-MM-DD
  - **Startzeit (startTime)**: Im Format HH:mm
  - **Bild-URL (imageUrl)**: Falls vorhanden, extrahiere das Hauptbild des Flyers
  - **Stadt (city)**: Ort des Events
  - **Kategorie (category)**: Falls das Event einem bestimmten Genre oder Typ zugeordnet werden kann (z. B. Konzert, Ausstellung, Workshop)
  - **Eintrittspreis (price)**: Falls vorhanden, gib den Preis an
  - **Ticket-Link (ticketLink)**: Falls angegeben, extrahiere die URL für Ticketkäufe
  - **Line-Up (lineup)**: Falls Künstler oder Sprecher erwähnt werden, extrahiere ihre Namen mit ggf. Rollen und Startzeiten
  - **Social Media Links (socialMediaLinks)**: Falls Social Media Links vorhanden sind, extrahiere Instagram, Facebook oder Twitter

Falls eine Information nicht vorhanden ist, setze sinnvolle Platzhalter.

**Antwortformat (JSON):**
{
  "title": "string",
  "description": "string",
  "startDate": "YYYY-MM-DD",
  "startTime": "HH:mm",
  "imageUrl": "string",
  "city": "string",
  "category": "string",
  "price": "string",
  "ticketLink": "string",
  "lineup": [
    {
      "name": "string",
      "role": "string",
      "startTime": "HH:mm"
    }
  ],
  "socialMediaLinks": {
    "instagram": "string",
    "facebook": "string",
    "twitter": "string"
  }
}`,
              },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      });

      if (!response.choices[0]?.message?.content) {
        throw new Error('Keine gültige Antwort von OpenAI erhalten.');
      }

      const parsedEvent = JSON.parse(response.choices[0].message.content);
      // Konvertiere das Datum in ein Date-Objekt
      if (parsedEvent.startDate) {
        parsedEvent.startDate = new Date(parsedEvent.startDate);
      }

      return parsedEvent;
    } catch (error) {
      console.error('Fehler bei der Extraktion oder Validierung:', error);
      return null;
    }
  };

  async searchEvents(params: {
    query: string;
    location?: string;
  }): Promise<Partial<Event>[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `Suche nach Events basierend auf: ${params.query} ${params.location ? `in ${params.location}` : ''}`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const events = JSON.parse(response.choices[0].message.content).events;
      return events.map((event: any) => ({
        title: event.title,
        description: event.description,
        startDate: new Date(event.startDate),
        startTime: event.startTime,
        imageUrl: event.imageUrl,
      }));
    } catch (error) {
      console.error('Fehler bei der Event-Suche:', error);
      return [];
    }
  }

  async extractTextFromImage(imageUrl: string): Promise<string> {
    console.info('Extracting text from image using OpenAI Vision...');

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: "What's in this image?" },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const extractedText = response.choices[0]?.message?.content?.trim();
    console.info('Extracted text:', extractedText);
    return extractedText || 'Kein Text erkannt';
  }
}
