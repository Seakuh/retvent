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
  async generateEventFromText(text: string) : Promise<Event> {
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
}