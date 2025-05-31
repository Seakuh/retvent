import { API_URL, Event } from "../utils";

export const searchNew = async (query?: string): Promise<Event[]> => {
  try {
    const response = await fetch(
      `${API_URL}/search/new?limit=25&query=${query || ""}`
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
