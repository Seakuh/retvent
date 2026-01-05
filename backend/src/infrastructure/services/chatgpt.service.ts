// src/infrastructure/services/chatgpt.service.ts
import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(ChatGPTService.name);

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
  async createEmbeddingV2(text: string) {
    // Sicherstellen, dass text immer ein gültiger String ist
    const inputText = typeof text === 'string' ? text.trim() : String(text || '').trim();
    
    if (!inputText) {
      throw new Error('Cannot create embedding from empty text');
    }
    
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: inputText,
    });
    return response.data[0].embedding;
  }

  async generateEventsFromText(text: string): Promise<Partial<Event>[]> {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract at least one event from the provided text and generate structured JSON objects based on the following rules:

              ### **Current Date:**  
Today's date is **${today}**. If the text does not mention a date, use this as the event start date in the format YYYY-MM-DD.

### Image Assignment Rule:
- If the text contains one or more image URLs, assign each image to the event it most likely belongs to.
- If multiple events are mentioned:
  - Use proximity (the image mentioned closest to an event’s description) to decide the match.
  - If no clear association exists, leave imageUrl empty for that event.
- Each event may have a different imageUrl.




### Extraction Rules:
- **Title (title)**: Extract the event name.
- **Description (description)**: Summarize the event text concisely, capturing essential details.
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
- **Tags (tags)**: Always include **five** relevant tags based on the event's theme.
- **Email (email)**: Extract the email address from the event text.

### Response Format (JSON):
[{
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
}]

Analyze the text carefully, ensuring accurate data extraction and logical fallback values. Return an array with at least one event. Ensure proper JSON formatting, and validate all fields before returning the result.`,
            },

            { type: 'text', text: text },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    const events = JSON.parse(response.choices[0].message.content);
    if (!Array.isArray(events) || events.length === 0) {
      throw new Error('Response must contain at least one event');
    }
    return events;
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
- **Tags (tags)**: Always include **five** relevant tags based on the event's theme.
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
  - Extract the **bio** from the input text and improve the grammar while keeping the artist's style. if there is a bio, add it to the bio plain field.
  - Extract all **links** (SoundCloud, Instagram, Bandcamp, Facebook, personal website, etc.).
  - If image URLs are included, add them to the gallery field.
  - Assign a matching **category** based on the artist's role. Possible values:  
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
            - **tags**: Generate exactly 5 relevant keywords based on the event's content.
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
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: charactersPrompt, // e.g. from your profilePrompts map (ScanTIger, GOSI, etc.)
        },
        {
          role: 'user',
          content: `
${charactersPrompt}
          
  fdu bist abgefuckter schon seit jahren technohörender atze 

  und hast eine berliner schnauze bist mürrisch 

  aber eingetlich eine sehr liebe seeele 

  
${JSON.stringify(event)}
  
  If the event includes artists or acts, mention them and share a quick thought about them. 
  Feel free to add a personal recommendation, general vibe, or opinion – as long as it's constructive and helpful for others.
  
  Write naturally like a real person on a public platform. Keep it max 2 sentences. dont start with an emojy.

  ask also some questions about the event to gether more information.

  nur höchstens ein satz 
  
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
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: charactersPrompt, // e.g. from your profilePrompts map (ScanTIger, GOSI, etc.)
        },
        {
          role: 'user',
          content: `

          ${charactersPrompt}

  fdu bist abgefuckter schon seit jahren technohörender atze 

  und hast eine berliner schnauze bist mürrisch 

  aber eingetlich eine sehr liebe seeele 

          Event: ${JSON.stringify(event)}
          Comment: ${JSON.stringify(comment)}
          if there is no comment, just write a short comment about the event.
          `.trim(),
        },
      ],
    });

    return response.choices[0]?.message?.content || '';
  }

  async generateRequestEmail(prompt: string) {
    const emailPrompt = `Als Musiklabel-Experte von Avanti, schreibe eine professionelle E-Mail an einen Künstler. 
    Verwende die folgende Sprache: ${prompt}
    Write a friendly, respectful, and groove-inspired email on behalf of the music label "Avanti" to an artist whose sound we really love. The email should:

Express genuine excitement about the artist’s music

Briefly introduce Avanti as a groove-driven label/platform based in Germany

Ask if we may promote and share their music in Germany through our label

Make it clear that the artist retains all rights to their music

Use a warm and open tone, include a few emojis, and keep it casual but professional

End with greetings from Berlin and a signature (e.g., “Much love, [Your Name] – Avanti”)`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: emailPrompt }],
    });
    return response.choices[0]?.message?.content || '';
  }

  async generateArtistDescription(prompt: string) {
    const descriptionPrompt = `Erstelle eine ausgewogene Künstlerbeschreibung basierend auf den folgenden Informationen: ${prompt}
    Die Beschreibung sollte:
    - Professionell und sachlich sein
    - Nicht übertrieben euphorisch
    - Einige passende Emojis enthalten (maximal 3-4)
    - Die wichtigsten Fakten und Erfolge hervorheben
    - Zwischen 100-150 Wörtern lang sein
    - Mit einem kurzen, prägnanten Fazit enden`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: descriptionPrompt }],
    });
    return response.choices[0]?.message?.content || '';
  }

  async generateArtistsAnnouncement(prompt: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0]?.message?.content || '';
  }

  async generateAnnouncement(prompt: string) {
    const announcementPrompt = `Erstelle eine spannende Ankündigung mit Teaser basierend auf: ${prompt}
    Die Ankündigung sollte:
    - Einen fesselnden Teaser am Anfang haben
    - Die wichtigsten Informationen enthalten
    - Einige passende Emojis verwenden (2-3)
    - Spannung aufbauen
    - Mit einem Call-to-Action enden
    - Zwischen 150-200 Wörtern lang sein
    - Professionell und ansprechend formuliert sein
    - Die Zielgruppe begeistern`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: announcementPrompt }],
    });
    return response.choices[0]?.message?.content || '';
  }

  // ============================================
  // POKER GAME LOGIC
  // ============================================

  async generateNewPokerGame(player1Id: string, player1Name: string, player2Id: string, player2Name: string): Promise<any> {
    const systemPrompt = `Du bist der Regisseur eines schnellen 1-gegen-1-Poker-Minispiels ("Heads-Up Hyper Turbo") in einer Mobile-/Web-App.
Deine Aufgabe ist es, kurze, spannende Pokerspiele zwischen zwei Spielern zu steuern und den Spielzustand immer in JSON-Form zu beschreiben.

WICHTIG: Antworte ausschließlich mit JSON, ohne zusätzliche Erklärungen oder Markdown-Formatierung.

Ziel des Spiels:
- Es spielen genau 2 Spieler gegeneinander
- Beide starten mit 500 Chips
- Die Blinds sind hoch (25/50) und steigen schnell
- Ein Spiel soll nur ca. 1–3 Minuten dauern
- Wer alle Chips des anderen hat, gewinnt

Kartenformat:
- Werte: 2–9, T, J, Q, K, A
- Farben: c (Clubs/Kreuz), d (Diamonds/Karo), h (Hearts/Herz), s (Spades/Pik)
- Beispiele: "Ah", "Td", "7c"

JSON-Struktur:
{
  "match": {
    "id": "string",
    "blindLevel": "25/50",
    "isFinished": false,
    "winnerId": null
  },
  "players": [
    {
      "id": "${player1Id}",
      "name": "${player1Name}",
      "stack": 500,
      "isDealer": true,
      "isSmallBlind": true,
      "isBigBlind": false,
      "holeCards": ["Ah", "Kd"],
      "hasFolded": false
    },
    {
      "id": "${player2Id}",
      "name": "${player2Name}",
      "stack": 500,
      "isDealer": false,
      "isSmallBlind": false,
      "isBigBlind": true,
      "holeCards": [],
      "hasFolded": false
    }
  ],
  "table": {
    "pot": 75,
    "communityCards": [],
    "street": "preflop",
    "lastAction": "game_start"
  },
  "action": {
    "currentPlayerId": "${player1Id}",
    "allowedActions": ["FOLD", "CALL", "RAISE", "ALL_IN"],
    "minBet": 50,
    "maxBet": 475
  }
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Erzeuge ein neues Heads-Up Poker-Spiel mit realistischer Kartenverteilung. Antworte nur mit dem JSON-Objekt, ohne zusätzlichen Text.' }
      ],
      temperature: 0.8, // Höhere Temperatur für mehr Variation
    });

    const content = response.choices[0]?.message?.content || '{}';
    // Remove markdown code blocks if present
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanContent);
  }

  async processPokerAction(currentGameState: any, action: { playerId: string, action: string, amount?: number }): Promise<any> {
    const systemPrompt = `Du bist der Regisseur eines schnellen 1-gegen-1-Poker-Minispiels.
Deine Aufgabe ist es, den Spielzustand nach einer Spieleraktion zu aktualisieren.

WICHTIG: Antworte ausschließlich mit dem aktualisierten JSON-Spielzustand, ohne zusätzliche Erklärungen oder Markdown-Formatierung.

Regeln:
- Aktualisiere Stacks und Pot korrekt
- Entwickle die street weiter wenn nötig (preflop → flop → turn → river → showdown)
- Bei showdown: Bestimme den Gewinner anhand der Pokerhände
- Setze isFinished=true wenn ein Spieler alle Chips verloren hat
- Keine Karte darf doppelt vorkommen
- Erzeuge realistische und spannende Spielverläufe
- Variiere Spielstile (tight, loose, aggressiv, passiv)

Kartenformat: 2–9, T, J, Q, K, A mit Farben c/d/h/s (z.B. "Ah", "Td")`;

    const userMessage = `Aktueller Spielzustand:
${JSON.stringify(currentGameState, null, 2)}

Spieleraktion:
- Spieler: ${action.playerId}
- Aktion: ${action.action}
${action.amount ? `- Betrag: ${action.amount}` : ''}

Verarbeite diese Aktion und gib den vollständig aktualisierten Spielzustand als JSON zurück. Antworte nur mit dem JSON-Objekt.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '{}';
    // Remove markdown code blocks if present
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanContent);
  } 

  /**
   * Generates a video prompt for event flyer video generation using kling-v2.1
   * The prompt is optimized for image-to-video generation and describes visual scenes
   * 
   * Example usage:
   * const event = await eventRepository.findById(eventId);
   * const videoPrompt = await chatGptService.generateVideoPrompt(event);
   * const video = await replicateService.createVideoFromImage({
   *   image: eventFlyerImage,
   *   prompt: videoPrompt,
   *   duration: 5
   * });
   */
  async generateVideoPrompt(event: Event): Promise<string> {
    // Extract key event information for the prompt
    const eventInfo = {
      title: event.title,
      description: event.description || '',
      category: event.category || '',
      city: event.city || '',
      startDate: event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }) : '',
      startTime: event.startTime || '',
      lineup: event.lineup?.map(l => l.name).join(', ') || '',
      tags: event.tags?.join(', ') || '',
    };

    const systemPrompt = `You are creating a visual video prompt for an AI image-to-video generator (kling-v2.1) that will animate an event flyer image.

Event Information:
- Title: ${eventInfo.title}
- Description: ${eventInfo.description}
- Category: ${eventInfo.category}
- Location: ${eventInfo.city}
- Date: ${eventInfo.startDate}
- Time: ${eventInfo.startTime}
- Lineup: ${eventInfo.lineup}
- Tags: ${eventInfo.tags}

Create a concise, visually descriptive prompt (50-80 words) that:
1. Describes dynamic visual movements and animations that would bring the event flyer to life
2. Focuses on visual elements like camera movements, lighting effects, text animations, and scene transitions
3. Captures the energy and atmosphere of the event type (e.g., music, sports, art, tech)
4. Uses cinematic language (e.g., "smooth camera pan", "dynamic zoom", "glowing text", "particle effects")
5. Avoids narrative text - focus on visual description only
6. Matches the event's mood and category (energetic for concerts, elegant for galas, tech-forward for conferences)

The prompt should be in English and optimized for video generation from a static event flyer image.

Example format: "Dynamic camera movement revealing event details, animated text elements with glowing effects, vibrant colors transitioning smoothly, energetic particle effects matching the event theme, smooth zoom on key information, cinematic lighting that highlights the event's atmosphere"`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at creating visual prompts for AI video generation. Focus on describing visual movements, animations, and cinematic effects.',
        },
        { role: 'user', content: systemPrompt },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    const generatedPrompt = response.choices[0]?.message?.content || '';
    
    // Fallback prompt if generation fails
    if (!generatedPrompt || generatedPrompt.trim().length < 20) {
      return `Dynamic camera movement revealing ${eventInfo.title} event details, animated text with glowing effects, vibrant colors transitioning smoothly, energetic visual effects matching ${eventInfo.category || 'the event'} theme, smooth cinematic zoom on key information`;
    }
    console.log('generatedPrompt', generatedPrompt);

    return generatedPrompt.trim();
  }

  /**
   * Generiert eine detaillierte Event-Beschreibung mit optionalen Künstler-Biografien
   * Fügt nur dann Künstler-Informationen hinzu, wenn die KI sich ganz sicher ist, dass es sich um bekannte Künstler handelt
   * 
   * @param event - Das Event-Objekt für das eine Beschreibung erstellt werden soll
   * @returns Eine vollständige, ansprechende Event-Beschreibung mit subtilen Emojis
   */
  async generate10NewEvents(): Promise<Partial<Event>[]> {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Erstelle genau 10 neue, realistische Events mit folgenden Informationen:

### **Current Date:**  
Today's date is **${today}**. Verwende zukünftige Daten für die Events.

### WICHTIGE REGELN:
- Erstelle genau 3 verschiedene Events
- Jedes Event MUSS eine imageUrl haben (verwende realistische öffentliche Bild-URLs, z.B. von Unsplash, Pexels oder ähnlichen Quellen)
- Die Events sollen vielfältig sein (Konzerte, Ausstellungen, Workshops, Sportevents, etc.)
- Verwende verschiedene deutsche Städte
- Die Events sollen in der Zukunft liegen (mindestens 1 Woche nach heute)

### Response Format (JSON):
{
  "events": [
    {
      "title": "string",
      "description": "string", 
      "startDate": "YYYY-MM-DD",
      "startTime": "HH:mm",
      "imageUrl": "string (MUSS vorhanden sein!)",
      "city": "string",
      "category": "string",
      "price": "string",
      "ticketLink": "string (optional)",
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
      "email": "string (optional)"
    }
  ]
}

WICHTIG: Jedes Event MUSS eine gültige imageUrl haben! Verwende URLs von öffentlichen Bildquellen wie Unsplash (z.B. https://images.unsplash.com/photo-...) oder Pexels.`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Keine Antwort von ChatGPT erhalten');
    }

    try {
      const parsed = JSON.parse(content);
      const events = parsed.events || [];
      
      if (!Array.isArray(events) || events.length === 0) {
        throw new Error('Keine Events in der Antwort gefunden');
      }

      this.logger.log(`✅ ${events.length} Events von ChatGPT generiert`);
      return events;
    } catch (error) {
      this.logger.error('Fehler beim Parsen der ChatGPT-Antwort:', error);
      throw new Error(`Fehler beim Parsen der Events: ${error.message}`);
    }
  }

  async generateDetailedEventDescription(event: Event): Promise<string> {
    const lineupNames = event.lineup?.map(l => l.name).join(', ') || '';
    const lineupInfo = event.lineup?.map(l => ({
      name: l.name,
      role: l.role || '',
      startTime: l.startTime || ''
    })) || [];

    const eventInfo = {
      title: event.title || '',
      description: event.description || '',
      category: event.category || '',
      city: event.city || '',
      startDate: event.startDate ? new Date(event.startDate).toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '',
      startTime: event.startTime || '',
      price: event.price || '',
      tags: event.tags?.join(', ') || '',
      lineup: lineupInfo
    };

    const systemPrompt = `Du bist ein Experte für Event-Beschreibungen und Musik-/Kunstszene. Deine Aufgabe ist es, eine ansprechende, detaillierte Beschreibung für ein Event zu erstellen.

WICHTIGE REGELN:
Starte mit einer omage zu dem event wenn artist auch an den künslter was zu erwarten ist.
1. Erstelle eine professionelle, ansprechende Event-Beschreibung (150-250 Wörter)
2. Verwende subtile, passende Emojis (maximal 4-6, sparsam und gezielt eingesetzt)
3. Wenn Künstler im Lineup sind, prüfe OB du dir GANZ SICHER bist, dass es sich um bekannte, identifizierbare Künstler handelt
4. Füge NUR dann Künstler-Biografien hinzu, wenn du dir zu 100% sicher bist - bei Unsicherheit weglassen!
5. Künstler-Informationen sollten kurz sein (1-2 Sätze zur Historie/Biografie) und nahtlos in die Beschreibung integriert werden
6. Die Beschreibung sollte die Atmosphäre, den Stil und die Besonderheiten des Events einfangen
7. Verwende eine natürliche, begeisternde Sprache, die zum Event-Typ passt
8. gib am schluss noch sicherheit den nutzern mit schließe ab wir freuen uns und gibt aufeinander acht abrunden das man sich auf die veranstaltung freut.

Event-Informationen:
- Titel: ${eventInfo.title}
- Kategorie: ${eventInfo.category}
- Stadt: ${eventInfo.city}
- Datum: ${eventInfo.startDate}
- Uhrzeit: ${eventInfo.startTime}
- Preis: ${eventInfo.price}
- Tags: ${eventInfo.tags}
- Lineup: ${JSON.stringify(eventInfo.lineup)}
- Bestehende Beschreibung: ${eventInfo.description}

Erstelle eine vollständige, ansprechende Beschreibung, die:
- Das Event lebendig und attraktiv darstellt
- Die wichtigsten Informationen enthält
- Bei bekannten Künstlern (nur wenn sicher identifiziert!) kurze Hintergrundinfos einbaut
- Subtile Emojis verwendet (z.B. 🎵 für Musik, 🎨 für Kunst, 🎭 für Theater, etc.)
- Die Leser begeistert und zum Besuch motiviert

Antworte NUR mit der fertigen Beschreibung, ohne zusätzliche Erklärungen. bitte auf Englisch antworten.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Experte für Event-Marketing und kulturelle Veranstaltungen. Du erstellst ansprechende, professionelle Event-Beschreibungen mit subtilen Emojis.',
          },
          { role: 'user', content: systemPrompt },
        ],
        temperature: 0.7,
        max_tokens: 600,
      });

      const generatedDescription = response.choices[0]?.message?.content?.trim() || '';
      
      // Fallback, falls keine Beschreibung generiert wurde
      if (!generatedDescription || generatedDescription.length < 50) {
        const fallbackDescription = `${eventInfo.title}${eventInfo.category ? ` - Ein ${eventInfo.category.toLowerCase()}` : ''}${eventInfo.city ? ` in ${eventInfo.city}` : ''}.${eventInfo.startDate ? ` Am ${eventInfo.startDate}` : ''}${eventInfo.startTime ? ` um ${eventInfo.startTime} Uhr` : ''}.${lineupNames ? ` Mit dabei: ${lineupNames}.` : ''}${eventInfo.description ? ` ${eventInfo.description}` : ''}`;
        return fallbackDescription;
      }

      return generatedDescription;
    } catch (error) {
      console.error('Fehler bei der Generierung der Event-Beschreibung:', error);
      // Fallback-Beschreibung bei Fehler
      const fallbackDescription = `${eventInfo.title}${eventInfo.category ? ` - Ein ${eventInfo.category.toLowerCase()}` : ''}${eventInfo.city ? ` in ${eventInfo.city}` : ''}.${eventInfo.startDate ? ` Am ${eventInfo.startDate}` : ''}${eventInfo.startTime ? ` um ${eventInfo.startTime} Uhr` : ''}.${lineupNames ? ` Mit dabei: ${lineupNames}.` : ''}${eventInfo.description ? ` ${eventInfo.description}` : ''}`;
      return fallbackDescription;
    }
  }
}
