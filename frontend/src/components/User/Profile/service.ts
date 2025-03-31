import { API_URL } from "../../../utils";

export const getProfile = async (userId: string) => {
  try {
    if (userId === "public") {
      return null;
    }
    const response = await fetch(`${API_URL}profile/${userId}`);

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const getUserEvents = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}events/host/id/${userId}`);
    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error("Error fetching user events:", error);
    return [];
  }
};

export const shareProfile = async (userId: string) => {
  console.log("userId", userId);
  if (!userId) return;
  try {
    const shareData = {
      url: `${window.location.origin}/profile/${userId}`,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        shareData.url
      )}`;
      window.open(whatsappUrl, "_blank");
    }
  } catch (error) {
    console.error("Error sharing profile:", error);
  }
};
