// @Get('advertisement/events')
// async getAdvertisementEvents(@Query('limit') limit: number = 10) {
//   const events = await this.eventService.findAdvertisementEvents(limit);
//   return { events };
// }

import { API_URL } from "../../utils";

export const getAdvertisementEvents = async (limit: number = 10) => {
  try {
    const response = await fetch(
      `${API_URL}events/advertisement/events?limit=${limit}`
    );
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error("Error fetching advertisement events:", error);
    return [];
  }
};
