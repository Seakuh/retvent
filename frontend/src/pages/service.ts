import { API_URL, Event, Profile, Ticket } from "../utils";

export const searchNew = async (
  query?: string,
  offset: number = 0
): Promise<Event[]> => {
  try {
    const response = await fetch(
      `${API_URL}events/search/new?limit=40&offset=${offset}&query=${
        query || ""
      }`
    );
    const data = await response.json();
    return data as Event[];
  } catch (error) {
    console.error("Error fetching new events:", error);
    return [];
  }
};

// @Get('search/new')
// async getNewEvents(
//   @Query('offset') offset: number = 0,
//   @Query('limit') limit: number = 10,
//   @Query('query') query?: string,
// ) {
//   return this.eventService.findNewEvents(offset, limit, query);
// }
export const searchProfiles = async (username: string): Promise<Profile[]> => {
  if (!username) return [];

  try {
    const response = await fetch(`${API_URL}profile/search/${username}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
};

export const getFits = async (): Promise<Profile[]> => {
  try {
    const response = await fetch(`${API_URL}profile/sponsored/latest`);
    const data = await response.json();
    console.log(data);
    return data.profiles as Profile[];
  } catch (error) {
    console.error("Error fetching fits:", error);
    return [];
  }
};

export const getReelEvents = async (
  eventId?: string,
  offset: number = 0,
  limit: number = 10
): Promise<Event[]> => {
  try {
    // Konstruiere die URL korrekt - entweder mit eventId oder ohne
    const baseUrl = eventId
      ? `${API_URL}events/reel/${eventId}?offset=${offset}&limit=${limit}`
      : `${API_URL}events/reel?offset=${offset}&limit=${limit}`;

    const response = await fetch(baseUrl);
    const data = await response.json();
    return data as Event[];
  } catch (error) {
    console.error("Error fetching reel events:", error);
    return [];
  }
};

export const getTicket = async (ticketId: string): Promise<Ticket> => {
  try {
    const response = await fetch(`${API_URL}tickets/ticket/${ticketId}`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch tickets: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("data", data);
    return data as Ticket;
  } catch (error) {
    console.error("🎫 Error fetching tickets:", error);
    throw new Error("Failed to load tickets. Please try again later! 🙏");
  }
};

export const getEvent = async (eventId: string): Promise<Event> => {
  try {
    const response = await fetch(`${API_URL}events/byId?id=${eventId}`);
    const data = await response.json();
    return data as Event;
  } catch (error) {
    console.error("🚨 Error fetching event:", error);
    return {} as Event;
  }

  
};


// SEARCH ARTISTS
export const searchArtists = async (query: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}events/search/artists?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(
        `Failed to search artists: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    return data as string[];
  } catch (error) {
    console.error("Error searching artists:", error);
    return [];
  }
};