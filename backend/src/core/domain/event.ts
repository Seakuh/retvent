
  export interface SearchParams {
    query: string;
    location?: string;
    dateRange?: { start: string; end: string };
  }
  
  export interface EventServicePort {
    searchEvents(params: SearchParams): Promise<Event[]>;
  }

  import { z } from 'zod';

export const EventSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  location: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  price: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  ticketUrl: z.string().optional(),
});

export type Event = z.infer<typeof EventSchema>;