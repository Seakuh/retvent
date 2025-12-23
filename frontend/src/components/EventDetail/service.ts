import { API_URL, Event, groupTypesWithEmoji } from "../../utils";

export const shareEventId = async (eventId: string) => {
  const shareData = {
    url: `https://event-scanner.com/event/${eventId}`,
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        shareData.url
      )}`;
      window.open(whatsappUrl, "_blank");
    }
  } catch (error) {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      shareData.url
    )}`;
    window.open(whatsappUrl, "_blank");
  }
};

export const shareEvent = (
  e: React.MouseEvent<HTMLDivElement>,
  event: Event
) => {
  e.preventDefault();
  e.stopPropagation(); // Verhindert das Navigieren zur Event-Detailseite

  const shareUrl = `https://event-scanner.com/event/${event.id}`;
  const title = event.title || "";
  const date = event.startDate
    ? new Date(event.startDate).toLocaleString("en-GB", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })
    : "";
  const lineup = event.lineup?.map((artist) => artist.name).join("\n") || "";

  const shareText = [
    `*${title}*`,
    date ? `📅 ${date}` : "",
    location ? `📍 ${event.city}` : "",
    "\n",
    lineup ? `⭐ Lineup: \n${lineup}` : undefined,
    "\n",
  ].filter(Boolean).join("\n");

  const shareData = {
    title,
    text: shareText,
    url: shareUrl,
  };

  if (navigator.share) {
    // For mobile devices that support Web Share API
    navigator.share({
      title,
      text: shareText,
      url: shareUrl,
    });
  } else {
    // Fallback for desktop browsers
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        console.log("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  }
};


export const handleAddToCalendar = (event: {
  startDate: string;
  startTime: string;
  city: string;
  address: string;
}) => {
  if (!event?.startDate) return;

  const formatDate = (date: string) => {
    return date.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };

  const startDate = new Date(event.startDate);
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 2);

  // Format: YYYYMMDDTHHMMSSZ
  const formattedStart = formatDate(startDate.toISOString());
  const formattedEnd = formatDate(endDate.toISOString());

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title
  )}&dates=${formattedStart}/${formattedEnd}&details=${encodeURIComponent(
    event.description || ""
  )}&location=${encodeURIComponent(event.city || "")}`;

  window.open(googleCalendarUrl, "_blank");
};

export class CreateGroupDto {
  name?: string;
  eventId?: string;
  description?: string;
  creatorId?: string;
  isPublic?: boolean;
  imageUrl?: string;
  memberIds?: string[];
}

export const createOrJoinGroupService = async (event: Event, group: string) => {
  const token = localStorage.getItem("access_token");
  console.log(event);
  const groupEmoji = groupTypesWithEmoji
    .find((g) => g.name === group)
    ?.emoji.toUpperCase();
  console.log(groupEmoji, group);
  if (!groupEmoji) {
    return { error: "Invalid group type" };
  }
  try {
    const createGroupDto: CreateGroupDto = {
      name: `${groupEmoji} ${group} | ${event.title} `,
      description: `${group} Group for ${event.title}`,
      eventId: event.id,
      isPublic: true,
      imageUrl: event.imageUrl,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}groups/create-or-join`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(createGroupDto),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating or joining group:", error);
  }
};

export const findSimilarEvents = async (id: string, limit: number = 3) => {
  try {
    const response = await fetch(
      `${API_URL}events/similar?id=${id}&limit=${limit}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error("Error fetching similar events:", error);
    return [];
  }
};
