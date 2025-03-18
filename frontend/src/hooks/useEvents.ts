import { useQuery, useQueryClient } from "@tanstack/react-query";
import { eventService } from "../services/api";

// Hook für alle Events oder gefilterte Events
export const useEvents = (category: string | null = null) => {
  return useQuery({
    queryKey: ["events", category], // 🔑 Key ändert sich mit Kategorie
    queryFn: () => eventService.getEventsByCategory(category),
    staleTime: 2 * 60 * 1000, // 🕐 2 Minuten "frisch"
    cacheTime: 15 * 60 * 1000, // 💾 15 Minuten im Cache
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Hook für einzelnes Event
export const useEvent = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["event", id],
    queryFn: () => eventService.getEventById(id),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    // 🎯 Prefetch verwandte Events
    onSuccess: (event) => {
      // Lade Events der gleichen Kategorie vor
      queryClient.prefetchQuery(["events", event.category], () =>
        eventService.getEventsByCategory(event.category)
      );
    },
  });
};
