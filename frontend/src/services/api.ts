const API_URL = import.meta.env.VITE_API_URL;

export const categoryService = {
  getCategories: async () => {
    const response = await fetch(`${API_URL}events/categories`);
    if (!response.ok) {
      throw new Error("Kategorien konnten nicht geladen werden 😢");
    }
    const data = await response.json();
    return data
      .filter((category: string) => category !== null && category !== "")
      .map(
        (category: string) =>
          category.charAt(0).toUpperCase() + category.slice(1)
      )
      .filter(
        (category: string, index: number, self: string[]) =>
          self.indexOf(category) === index
      );
  },
};

export const eventService = {
  // Alle Events holen
  getEvents: async () => {
    const response = await fetch(`${API_URL}events`);
    if (!response.ok) throw new Error("Events konnten nicht geladen werden 😢");
    return response.json();
  },

  // Events nach Kategorie filtern
  getEventsByCategory: async (category: string | null) => {
    const response = await fetch(
      `${API_URL}events${category ? `?category=${category}` : ""}`
    );
    if (!response.ok) throw new Error("Events konnten nicht geladen werden 😢");
    return response.json();
  },

  // Einzelnes Event laden
  getEventById: async (id: string) => {
    const response = await fetch(`${API_URL}events/${id}`);
    if (!response.ok) throw new Error("Event konnte nicht geladen werden 😢");
    return response.json();
  },
};
