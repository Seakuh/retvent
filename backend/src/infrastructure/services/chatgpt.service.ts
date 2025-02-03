// src/infrastructure/services/chatgpt.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Event } from '../../core/domain/event';
import { z } from 'zod';

// Definiere ein Schema für die API-Validierung
const EventResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  startDate: z.string(),
  startTime: z.string(),
  locationId: z.string(),
  organizerId: z.string(),
});

@Injectable()
export class ChatGPTService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_API_KEY,
    });
  }


  extractEventFromFlyer = async (imageUrl: string): Promise<Partial<Event> | null> => {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extrahiere die wichtigsten Informationen aus diesem Event-Flyer und erstelle ein vollständiges JSON-Event-Objekt. 
                
                **Regeln für die Extraktion:**
                - Extrahiere: Titel, Beschreibung, Startdatum, Startzeit
                - Falls eine Information fehlt, setze sinnvolle Platzhalter
                - Datum im Format YYYY-MM-DD
                - Zeit im Format HH:mm
      
                **Antwortformat (JSON):**
                {
                  "title": "string",
                  "description": "string",
                  "startDate": "YYYY-MM-DD",
                  "startTime": "HH:mm",
                  "imageUrl": "string"
                }`
              },
              { type: "image_url", image_url: { url: imageUrl } }
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      if (!response.choices[0]?.message?.content) {
        throw new Error("Keine gültige Antwort von OpenAI erhalten.");
      }

      const parsedEvent = JSON.parse(response.choices[0].message.content);
      // Konvertiere das Datum in ein Date-Objekt
      if (parsedEvent.startDate) {
        parsedEvent.startDate = new Date(parsedEvent.startDate);
      }
      
      return parsedEvent;
    } catch (error) {
      console.error("Fehler bei der Extraktion oder Validierung:", error);
      return null;
    }
  };

  async searchEvents(params: { query: string; location?: string }): Promise<Partial<Event>[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Suche nach Events basierend auf: ${params.query} ${params.location ? `in ${params.location}` : ''}`
          }
        ],
        response_format: { type: "json_object" },
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
      console.error("Fehler bei der Event-Suche:", error);
      return [];
    }
  }

  async extractTextFromImage(imageUrl: string): Promise<string> {
    console.info('Extracting text from image using OpenAI Vision...');

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What's in this image?" },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const extractedText = response.choices[0]?.message?.content?.trim();
    console.info('Extracted text:', extractedText);
    return extractedText || 'Kein Text erkannt';
  }

  async processEventData(data: any): Promise<Partial<Event>> {
    return {
      title: data.title || 'Neues Event',
      description: data.description || 'Eventbeschreibung',
      date: new Date(),
      category: data.category || 'Unspecified',
      locationId: data.locationId || '',
      creatorId: data.creatorId || '',
      imageUrl: data.imageUrl || '',
      likedBy: [],
      likesCount: 0,
      artistIds: []
    };
  }
}