import { Event } from "../../utils";

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
