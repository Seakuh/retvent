// src/infrastructure/services/chatgpt.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Profile } from 'src/core/domain/profile';
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

  async createEmbedding(text: string) {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
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
      const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract the key information from the provided event flyer and generate a structured JSON object based on the following rules:

                ### **Current Date:**  
Today's date is **${today}**. If the flyer does not mention a date, use this as the event start date in the format YYYY-MM-DD.


### Extraction Rules:
- **Title (title)**: Extract the event name.
- **Description (description)**: Summarize the event flyer text concisely, capturing essential details.
- **Start Date (startDate)**: If no date is provided, set it to today's date in YYYY-MM-DD format.
- **Start Time (startTime)**: If no time is mentioned, default to "08:00" in HH:mm format.
- **Image URL (imageUrl)**: Extract the main image URL if available; otherwise, leave it empty.
- **City (city)**: Identify the event's location (city).
- **Category (category)**: Assign one single category that best describes the event (e.g., "Concert", "Exhibition", "Workshop"). Avoid slashes (/) or multiple categories.
- **Price (price)**: Extract the ticket price as a decimal number (e.g., "15.00") or a meaningful label if not found (e.g., "Free", "N/A").
- **Ticket Link (ticketLink)**: Extract the URL for ticket purchases if available; otherwise, leave it empty.
- **Line-Up (lineup)**: If performers or speakers are listed, extract their names, roles, and scheduled start times.
- **Social Media Links (socialMediaLinks)**: Extract Instagram, Facebook, and Twitter links. If a platform-specific link is missing, use the general platform URL as a fallback.
  - **Fallbacks:**
    - Instagram → "https://www.instagram.com"
    - Facebook → "https://www.facebook.com"
    - Twitter → "https://www.twitter.com"
- **Tags (tags)**: Always include **five** relevant tags based on the event’s theme.
- **Email (email)**: Extract the email address from the event flyer.

### Response Format (JSON):
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
  "address": {
    "street": "string",
    "houseNumber": "string",
    "city": "string"
  },
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
  },
  "tags": ["string", "string", "string", "string", "string"],
  "email": "string"
}

Analyze the flyer carefully, ensuring accurate data extraction and logical fallback values. Ensure proper JSON formatting, and validate all fields before returning the result.`,
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

  async generateArtistProfile(
    inputFromUser: string,
  ): Promise<Partial<Profile>> {
    const artistPrompt = `
  You are a helpful assistant that extracts structured profile information from an artist introduction or description text.
  
  Your goal is to generate a structured JavaScript object that matches this shape:
  
  {
    bio: string,
    links: string[], // social media or music platform links (e.g. SoundCloud, Instagram, Bandcamp, etc.)
    gallery: string[], // optional image URLs, if mentioned
    category: 'organizer' | 'musician' | 'visual_artist' | 'technician' | 'doorman' | 'helper' | 'cook',
    profileImageUrl?: string, // optional image link if available
    headerImageUrl?: string, // optional header image link
    giphyLinks?: string[], // optional giphy link
  }
  
  Instructions:
  - Extract the **bio** from the input text and improve the grammar while keeping the artist’s style. if there is a bio, add it to the bio plain field.
  - Extract all **links** (SoundCloud, Instagram, Bandcamp, Facebook, personal website, etc.).
  - If image URLs are included, add them to the gallery field.
  - Assign a matching **category** based on the artist’s role. Possible values:  
    - "organizer", "musician", "visual_artist", "technician", "doorman", "helper", "cook"
  - Return only the final JavaScript object as your response (no explanation).
  
  Here is the artist text:
  
  "${inputFromUser}"

Ensure proper JSON formatting, and validate all fields before returning the result.

  `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: artistPrompt }],
      response_format: { type: 'json_object' },
    });

    const rawOutput = response.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsed = eval('(' + rawOutput + ')') as Partial<Profile>;
      return parsed;
    } catch (error) {
      console.error('Failed to parse artist profile:', rawOutput);
      throw new Error('Could not parse OpenAI response');
    }
  }
}
