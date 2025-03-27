import { Event } from "../../utils";

export const handleWhatsAppShare = async (eventToShare: Event) => {
  console.log("handleWhatsAppShare", eventToShare);
  if (!eventToShare) return;
  const message = `
  *${eventToShare.title}*\n
  📍 ${eventToShare.city || "N/A"}
  📅 ${formatDate(eventToShare.startDate?.toString() || "")}
  🕒 ${eventToShare.startTime?.toString() || ""}\n
  ${`https://event-scanner.com/event/${eventToShare.id}`}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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
