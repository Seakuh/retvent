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
