export const fetchNearbyEvents = async (
  lat: number,
  lon: number,
  isInitial: boolean = false
) => {
  const response = await fetch(
    `${
      import.meta.env.VITE_API_URL
    }events/nearby/map?lat=${lat}&lon=${lon}&distance=${
      isInitial ? 100 : 25
    }&limit=30`
  );
  return response.json();
};

export const fetchNewEvents = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}events/latest?limit=40`
  );
  console.log("response", response);
  return response.json();
};

export const fetchFavoriteEvents = async (ids: string[]) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}events/byIds?ids=${ids.join(",")}`
  );
  console.log("response", response);
  return response.json();
};

export const fetchAllEvents = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}events/latest?limit=40`
  );
  console.log("response", response);
  return response.json();
};

export const fetchPopularEvents = async (lat: number, lon: number) => {
  const response = await fetch(
    `${
      import.meta.env.VITE_API_URL
    }events/popular/nearby?lat=${lat}&lon=${lon}&distance=100&limit=40`
  );
  return response.json();
};
