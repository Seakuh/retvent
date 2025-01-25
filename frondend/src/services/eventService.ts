import { Event, SearchParams } from '../types/event';

const API_KEY = 'YOUR_TICKETMASTER_API_KEY'; // Hinweis: Sie müssen einen API-Key von Ticketmaster bekommen
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

export const searchEvents = async (params: SearchParams): Promise<Event[]> => {
  const queryParams = new URLSearchParams({
    apikey: API_KEY,
    keyword: params.keyword || '',
    city: params.city || '',
    classificationName: params.category || '',
  });

  try {
    const response = await fetch(`${BASE_URL}/events.json?${queryParams}`);
    const data = await response.json();
    
    return data._embedded?.events.map((event: any) => ({
      id: event.id,
      name: event.name,
      date: event.dates.start.localDate,
      location: event._embedded?.venues[0]?.name || 'Location TBA',
      description: event.description || 'No description available',
      imageUrl: event.images[0]?.url,
      category: event.classifications[0]?.segment?.name,
      price: event.priceRanges ? `${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}` : 'Price TBA'
    })) || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};