import { Event } from "../../utils";

export const handleWhatsAppShare = async (event: Event) => {
  if (!event) return;
  const message = `${event.title}\nLet us join the event 🎉\n📅${window.location.href}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
};
