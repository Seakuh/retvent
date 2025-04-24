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

export const shareEvent = async (eventToShare: Event) => {
  if (!eventToShare) return;

  // const formattedDate = eventToShare.startDate
  //   ? new Date(eventToShare.startDate).toLocaleDateString("de-DE", {
  //       day: "2-digit",
  //       month: "2-digit",
  //       year: "numeric",
  //     })
  //   : "";

  const shareData = {
    // title: eventToShare.title,
    // text: `${eventToShare.title}\n\n📍 ${
    //   eventToShare.city || "N/A"
    // }\n📅 ${formattedDate}\n🕒 ${eventToShare.startTime || ""}\n\n`,
    url: `https://event-scanner.com/event/${eventToShare.id}`,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback für Browser, die die Web Share API nicht unterstützen
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        shareData.text + shareData.url
      )}`;
      window.open(whatsappUrl, "_blank");
    }
  } catch (error) {
    console.error("Error sharing event:", error);
    // Fallback auf WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      shareData.text + shareData.url
    )}`;
    window.open(whatsappUrl, "_blank");
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
