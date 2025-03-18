import { useQuery } from "@tanstack/react-query";
import { categoryService } from "../services/api";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"], // 🔑 Eindeutiger Key für den Cache
    queryFn: categoryService.getCategories,
    staleTime: 5 * 60 * 1000, // 🕐 Daten bleiben 5 Minuten "frisch"
    cacheTime: 30 * 60 * 1000, // 💾 Cache wird 30 Minuten gespeichert
    retry: 3, // 🔄 Anzahl der Wiederholungsversuche bei Fehlern
    refetchOnWindowFocus: false, // 🪟 Kein automatisches Neuladen beim Fokuswechsel
  });
};
