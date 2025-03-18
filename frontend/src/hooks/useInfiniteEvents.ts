import { useInfiniteQuery } from "@tanstack/react-query";

export const useInfiniteEvents = (category: string | null = null) => {
  return useInfiniteQuery({
    queryKey: ["infiniteEvents", category],
    queryFn: ({ pageParam = 1 }) =>
      eventService.getEventsByCategory(category, pageParam),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000,
  });
};
