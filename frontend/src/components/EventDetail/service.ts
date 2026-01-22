import { API_URL, Event, groupTypesWithEmoji, getEventUrl } from "../../utils";

export const shareEventId = async (eventId: string, event?: Event) => {
  // Wenn Event-Objekt vorhanden ist, verwende getEventUrl für Slug-URL
  const eventUrl = event ? getEventUrl(event) : `/event/${eventId}`;
  const shareUrl = `https://event-scanner.com${eventUrl}`;
  const shareData = {
    url: shareUrl,
  };
  
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      showCopiedMessage();
    }
  } catch (error) {
    // Wenn Share fehlschlägt, copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      showCopiedMessage();
    } catch (clipboardError) {
      console.error("Failed to copy to clipboard:", clipboardError);
    }
  }
};

// Hilfsfunktion für "Copied" Meldung
const showCopiedMessage = () => {
  // Erstelle ein temporäres Element für die Meldung
  const message = document.createElement("div");
  message.textContent = "Copied";
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #000;
    color: #fff;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: fadeInOut 2s ease-in-out;
  `;
  
  // Füge Animation hinzu
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-10px); }
      20% { opacity: 1; transform: translateY(0); }
      80% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-10px); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(message);
  
  // Entferne nach 2 Sekunden
  setTimeout(() => {
    message.remove();
    style.remove();
  }, 2000);
};

export const shareEvent = async (
  e: React.MouseEvent<HTMLDivElement>,
  event: Event
) => {
  e.preventDefault();
  e.stopPropagation(); // Verhindert das Navigieren zur Event-Detailseite

  // Verwende getEventUrl für konsistente Slug-URL-Generierung
  const eventUrl = getEventUrl(event);
  const shareUrl = `https://event-scanner.com${eventUrl}`;
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
    event.city ? `📍 ${event.city}` : "",
    "\n",
    lineup ? `⭐ Lineup: \n${lineup}` : undefined,
    "\n",
  ].filter(Boolean).join("\n");

  const shareData = {
    title,
    text: shareText,
    url: shareUrl,
  };

  try {
    if (navigator.share) {
      // For mobile devices that support Web Share API
      await navigator.share(shareData);
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      showCopiedMessage();
    }
  } catch (error) {
    // Wenn Share fehlschlägt, copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      showCopiedMessage();
    } catch (clipboardError) {
      console.error("Failed to copy to clipboard:", clipboardError);
    }
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
