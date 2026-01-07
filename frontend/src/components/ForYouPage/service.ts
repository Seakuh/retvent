import { API_URL, Event } from "../../utils";
import { onboardingService } from "../../services/onboarding.service";

export interface RecommendedEvent {
  event: Event;
  similarityScore: number;
}

/**
 * Load recommended events from the vector profile results endpoint
 * Only calls the API if onboarding_completed is true in localStorage
 */
export const loadRecommendedEvents = async (
  offset: number = 0,
  limit: number = 20
): Promise<RecommendedEvent[]> => {
  // Check if onboarding is completed
  if (!onboardingService.hasCompletedOnboarding()) {
    console.log("Onboarding not completed, skipping recommended events fetch");
    return [];
  }

  const token = localStorage.getItem("access_token");
  if (!token) {
    console.log("No access token found, skipping recommended events fetch");
    return [];
  }

  try {
    const response = await fetch(
      `${API_URL}events/vector/profile/results/recommendations?offset=${offset}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch recommended events: ${response.statusText}`);
    }

    const data: RecommendedEvent[] = await response.json();
    console.log("✅ Loaded recommended events:", data.length);
    return data;
  } catch (error) {
    console.error("❌ Error loading recommended events:", error);
    return [];
  }
};

/**
 * Load history events by IDs from localStorage
 */
export const loadHistoryEvents = async (): Promise<Event[]> => {
  const EVENT_HISTORY_KEY = "recentEvents";
  
  try {
    const historyIds = localStorage.getItem(EVENT_HISTORY_KEY);
    if (!historyIds) {
      return [];
    }

    const eventIds: string[] = JSON.parse(historyIds);
    if (eventIds.length === 0) {
      return [];
    }

    // Fetch events by IDs
    const eventsPromises = eventIds.map(async (id) => {
      try {
        const response = await fetch(`${API_URL}events/v2/byId?id=${id}`);
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error(`Failed to fetch event ${id}:`, error);
        return null;
      }
    });

    const events = await Promise.all(eventsPromises);
    const validEvents = events.filter(
      (event): event is Event => event !== null
    );

    return validEvents;
  } catch (error) {
    console.error("Failed to load history events:", error);
    return [];
  }
};

