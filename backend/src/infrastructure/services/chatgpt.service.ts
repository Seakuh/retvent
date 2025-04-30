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

  extractLineUpFromFlyer = async (
    imageUrl: string,
    currentLineup?: Array<{
      name: string;
      role?: string;
      startTime?: string;
      endTime?: string;
    }>,
  ): Promise<
    Array<{
      name: string;
      role?: string;
      startTime?: string;
      endTime?: string;
    }>
  > => {
    const prompt = `
  You are an expert in event flyer analysis.
  
  Task:
  Analyze the image at the following URL and extract the performing artists (line-up), including their names, roles (e.g., DJ, live, VJ), and scheduled times if available.
  

  Current Lineup (do not include these again, only add new names you find):
  ${JSON.stringify(currentLineup || [])}

  
  Instructions:
  - Extract all performer/artist names visible on the flyer
  - If roles (e.g., DJ, live act, VJ, host) are specified, include them
  - If start times are shown, include them in HH:mm format
  - If end times are shown, include them in HH:mm format
  - If only names are visible with no additional information, extract just the names
  
  Response Format (JSON only):
  {
    "lineup": [
      {
        "name": "string",
        "role": "string or null if unavailable",
        "startTime": "HH:mm or null if unavailable",
        "endTime": "HH:mm or null if unavailable"
      }
    ]
  }
  
  Important: Extract ALL names that appear to be part of the lineup, even if they don't have additional information.
  Do NOT include any explanations or additional text, only return the JSON result.
  `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],

        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.error('Empty response from OpenAI');
        return [];
      }

      try {
        const parsed = JSON.parse(content);
        const existingNames = new Set(
          (currentLineup || []).map((e) => e.name.trim().toLowerCase()),
        );
        const newEntries = (parsed.lineup || []).filter(
          (entry) =>
            entry.name && !existingNames.has(entry.name.trim().toLowerCase()),
        );

        return [...(currentLineup || []), ...newEntries];
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        console.log('Raw response:', content);
        return [];
      }
    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      return [];
    }
  };

  extractEventFromPrompt = async (
    prompt: string,
    event: Event,
  ): Promise<Partial<Event> | null> => {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: ` You are an intelligent assistant helping to update a structured event object based on new user input. Your task is to carefully review the current event data and selectively update it using the provided user prompt.
            
            ---
            
            ### 🧠 Objective:
            Update the event fields **only if** the user prompt provides **better, more specific, or missing information**.
            
            If a field in the current event already contains a well-written or complete value (e.g. a clear title or detailed description), **retain it**.
            
            ---
            
            ### 📅 Today's Date:
            Today's date is **${today}**.
            Use this as fallback \`startDate\` if no specific date is mentioned.
            
            ---
            
            ### 🔍 Event Context:
            **Current Event JSON**:
            json
            ${JSON.stringify(event)}
            
            
            **User Prompt**:
            
            ${prompt}
            
            
            ---
            
            ### 🛠 Update Logic:
            
            Apply the following rules:
            
            - **title**: Update only if the prompt clearly provides a better or more accurate event title.
            - **description**: Keep existing if already detailed and precise. Otherwise, summarize the flyer text briefly and informatively.
            - **startDate**: Extract from the prompt. If missing, use today's date (**${today}**) in format YYYY-MM-DD.
            - **startTime**: Extract if mentioned; fallback: "08:00".
            - **imageUrl**: Extract if found; otherwise leave empty.
            - **city**: Extract location or city.
            - **category**: Use one word like "Concert", "Exhibition", "Workshop", etc. No slashes or multiple values.
            - **price**: Use the number as string if found (e.g. "12.00"), otherwise "Free" or "N/A".
            - **ticketLink**: Extract ticket purchase link or leave empty.
            - **lineup**: If present, extract names, roles, and (optional) start times of performers/speakers.
            - **socialMediaLinks**: Extract Facebook, Instagram, and Twitter URLs. If missing, fallback to:
              - Instagram: https://www.instagram.com
              - Facebook: https://www.facebook.com
              - Twitter: https://www.twitter.com
            - **tags**: Generate exactly 5 relevant keywords based on the event’s content.
            - **email**: Extract if present.
            - **address**: Include street, houseNumber, and city. Leave values empty if unknown.
            
            ---
            
            ### ✅ Final Output:
            Return the **updated event object only** as valid, parseable **JSON** with this structure:
            
            json
            {
              "title": "string",
              "description": "string",
              "startDate": "YYYY-MM-DD",
              "startTime": "HH:mm",
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
            
            
            ---
            
            Do not explain the data. Just return the final JSON with updated values.
            `,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const rawOutput = response.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsed = JSON.parse(rawOutput);
      return parsed;
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      return null;
    }
  };

  async generateCommentForEvent(
    charactersPrompt: string,
    event: Event,
  ): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: charactersPrompt, // e.g. from your profilePrompts map (ScanTIger, GOSI, etc.)
        },
        {
          role: 'user',
          content: `
  You are an active user on the EventScanner platform. You want to support the community by sharing helpful, thoughtful comments about events and engaging in discussions.
  
  Please write a short and friendly comment about the following event:
  
${JSON.stringify(event)}
  
  If the event includes artists or acts, mention them and share a quick thought about them. 
  Feel free to add a personal recommendation, general vibe, or opinion – as long as it's constructive and helpful for others.
  
  Write naturally like a real person on a public platform. Keep it max 2 sentences. dont start with an emojy.

  ask also some questions about the event to gether more information.
          `.trim(),
        },
      ],
    });

    return response.choices[0]?.message?.content || '';
  }

  async generateReplyCommentForEvent(
    charactersPrompt: string,
    event: Event,
    comment: string,
  ): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: charactersPrompt, // e.g. from your profilePrompts map (ScanTIger, GOSI, etc.)
        },
        {
          role: 'user',
          content: `

        Please write a short and natural reply to the following user comment about an event. The reply should either:
          - answer their question,
          - react positively to their experience,
          - or ask a thoughtful question to learn more or continue the conversation.

          be supportive. You can show excitement or curiosity, but do not start your message with an emoji. Keep your reply under 2 sentences.

          Event: ${JSON.stringify(event)}
          Comment: ${JSON.stringify(comment)}
          if there is no comment, just write a short comment about the event.
          `.trim(),
        },
      ],
    });

    return response.choices[0]?.message?.content || '';
  }
}
