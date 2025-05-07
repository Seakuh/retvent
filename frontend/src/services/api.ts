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

  // <3 get favorites
  getFavorites: async () => {
    try {
      const response = await fetch(`${API_URL}users/me/favorites`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log("GET FAVORITES RESPONSE: " + response.json);

      if (!response.ok) {
        if (response.status === 401) {
          // Wenn nicht eingeloggt, leeres Array zurückgeben
          return [];
        }
        throw new Error("Favorites could not be loaded");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error loading favorites:", error);
      return [];
    }
  },

  // @Delete('/favorites/:id')
  // @UseGuards(JwtAuthGuard)
  // async removeFavorite(@Param('id') id: string, @Req() req) {
  //   const userId = req.user.sub;
  //   return this.userService.removeFavorite(userId, id);
  // }
  removeFavorite: async (id: string) => {
    const response = await fetch(`${API_URL}users/favorites/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    if (!response.ok) {
      throw new Error("Favorites could not be removed");
    }
    return response.json();
  },
  // @Post('/favorites/:id')
  // @UseGuards(JwtAuthGuard)
  // async addFavorite(@Param('id') id: string, @Req() req) {
  //   const userId = req.user.sub;
  //   return this.userService.addFavorite(userId, id);
  // }
  addFavorite: async (id: string) => {
    const response = await fetch(`${API_URL}users/favorites/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    if (!response.ok) {
      throw new Error("Favorites could not be added");
    }
    return response.json();
  },

  // <3 save favorites
  saveFavorites: async (favorites: string[]) => {
    try {
      const response = await fetch(`${API_URL}users/favorites`, {
        method: "PUT", // Geändert von POST zu PUT
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(favorites),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Wenn nicht eingeloggt, trotzdem weitermachen
          return [];
        }
        throw new Error("Favorites could not be saved");
      }

      return response.json();
    } catch (error) {
      console.error("Fehler beim Speichern der Favoriten:", error);
      return [];
    }
  },
};
