import { API_URL, Event, Profile } from "../utils";

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
