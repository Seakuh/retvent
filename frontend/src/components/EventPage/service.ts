export const fetchNearbyEvents = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}events/nearby`);
  return response.json();
};

export const fetchNewEvents = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}events/new`);
  return response.json();
};

export const fetchFavoriteEvents = async (ids: string[]) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}events/byIds`, {
    params: {
      ids: ids.join(","),
    },
  });
  return response.json();
};
