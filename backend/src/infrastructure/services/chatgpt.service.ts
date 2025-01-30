// src/infrastructure/services/chatgpt.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Event, EventSchema } from '../../core/domain/event';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

@Injectable()
export class ChatGPTService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_API_KEY, // Lade den API-Key aus der Konfiguration
    });
  }


  // TODO EXTRACT TEXT AND OBJECT
  async generateEventFromText(text: string): Promise<Event> {
    // const response = await this.openai.createCompletion({
    //   model: 'gpt-4',
    //   prompt: `Create an event object from the following text: ${text}`,
    //   max_tokens: 150,
    // });
    // return JSON.parse(response.data.choices[0].text);
    const mockEvent: Event = {
      id: '1',
      name: 'Event Name',
      date: '2022-01-01',
      location: 'Event Location',
      description: 'Event Description',
    };

    return mockEvent
  }

  extractEventFromFlyer = async (imageUrl: string): Promise<Event | null> => {
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
                - Setze keine null-Werte. Falls eine Information fehlt, nutze einen sinnvollen Platzhalter.
                - **Datum:** Falls kein Datum erkennbar ist, setze "TBA" (To Be Announced).
                - **Ort:** Falls unbekannt, setze "Unbekannter Ort".
                - **Beschreibung:** Falls nicht klar, generiere eine kurze, aber ansprechende Beschreibung.
                - **Kategorie:** Nutze eine der vordefinierten Event-Kategorien: ["Party", "Festival", "Workshop", "Kunst", "Tech", "Sport", "Kultur", "Sonstiges"].
                - **Preis:** Falls nicht angegeben, setze "Eintritt frei".
                - **Koordinaten:** Falls der Ort nicht eindeutig erkannt wird, nutze eine allgemeine Stadtmitte (z. B. Berlin = 52.52, 13.405).
                - **Ticket-URL:** Falls nicht angegeben, setze "Nicht verfügbar".
      
                **Antwortformat (JSON, KEINE zusätzlichen Kommentare oder Text):**
                {
                  "name": "string (Event-Name, falls nicht vorhanden: 'Event ohne Titel')",
                  "date": "string (YYYY-MM-DD oder 'TBA' falls unbekannt)",
                  "location": "string (Falls bekannt, offizieller Name oder 'Unbekannter Ort')",
                  "description": "string (Ansprechende Event-Beschreibung basierend auf dem Flyer)",
                  "category": "string (Eine aus: Party, Festival, Workshop, Kunst, Tech, Sport, Kultur, Sonstiges)",
                  "price": "string (Falls nicht angegeben, 'Eintritt frei')",
                  "latitude": number (Falls möglich, Koordinaten des Ortes; andernfalls allgemeine Stadt-Koordinaten),
                  "longitude": number (Falls möglich, Koordinaten des Ortes; andernfalls allgemeine Stadt-Koordinaten),
                  "ticketUrl": "string (Falls verfügbar, sonst 'Nicht verfügbar')"
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

      console.info('OpenAI API Response:', response.choices[0].message.content);

      const parsedEvent = JSON.parse(response.choices[0].message.content);
      return parsedEvent;
    } catch (error) {
      console.error("Fehler bei der Extraktion oder Validierung:", error);
      return null;
    }
  };

  async searchEvents(params: { query: string; location?: string }): Promise<Event[]> {
    const extractionPrompt = `
    Your task is to extract multiple events from the given query and location.

    Query: ${params.query}
    Location: ${params.location || 'Not specified'}

    **Important Instructions:**
    - Always return at least **3 different events**.
    - The response **must** be a JSON object in the **following exact format**:
    
    {
      "events": [
        {
          "id": "string",
          "name": "string",
          "date": "string",
          "location": "string",
          "description": "string",
          "imageUrl": "string (optional)",
          "category": "string (optional)",
          "price": "string (optional)",
          "latitude": "number (optional)",
          "longitude": "number (optional)",
          "ticketUrl": "string (optional)"
        },
        { ... more events ... }
      ]
    }

    - **Never return a single object!** Always wrap the events inside an array.
    - If there is only one event, duplicate it with slight variations in title, description, and date.
    - Do not include explanations, only return raw JSON.
  `;

    const completion = await this.openai.beta.chat.completions.parse({
      model: 'gpt-4o', // GPT-4o mini als Modell
      messages: [
        { role: 'system', content: extractionPrompt },
        { role: 'user', content: 'Please give all the events in the correct format.' },
      ],
      response_format: zodResponseFormat(EventSchema, 'events'), // Korrektes Schema übergeben
    });

    console.log('OpenAI API Response:', completion.choices[0].message.parsed);

    // Extrahiere Events aus der Antwort
    const chatGPTEvents = completion.choices[0].message.parsed || [];

    if (!Array.isArray(chatGPTEvents)) {
      throw new Error("OpenAI API response did not return an array of events");
    }

    return chatGPTEvents;
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
            {
              type: "image_url",
              image_url: {
                "url": imageUrl,
              },
            },
          ],
        },
      ],
      store: true,
    });

    const extractedText = response.choices[0]?.message?.content?.trim();
    console.info('Extracted text:', extractedText);
    return extractedText || 'Kein Text erkannt';
  }
}