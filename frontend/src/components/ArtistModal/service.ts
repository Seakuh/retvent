export const setUpNewArtist = async (artist: Artist) => {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
};
