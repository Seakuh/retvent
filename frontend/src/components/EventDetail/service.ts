import { Event } from "../../utils";

export const handleWhatsAppShare = async (eventToShare: Event) => {
  console.log("handleWhatsAppShare", eventToShare);
  if (!eventToShare) return;
  const message = `
  *${eventToShare.title}*\n
  📍${eventToShare.city || "N/A"}\n
  📅${eventToShare.startDate || "N/A"}
  🕒 ${eventToShare.startTime || ""}
  \n
  \n
  ${`https://event-scanner.com/event/${eventToShare.id}`}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
};
