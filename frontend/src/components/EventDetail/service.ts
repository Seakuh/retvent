import { Event } from "../../utils";

export const handleWhatsAppShare = async (event: Event) => {
  if (!event) return;

  const message = `Hey - I just found this on Event Scanner\n\nLet us join the event 🎉 ${
    event.title
  }\n📅 ${new Date(event.startDate || "").toLocaleDateString("de-DE")}\n${
    event.startTime ? `⏰ ${event.startTime}\n` : ""
  }📍 ${event.city || ""}\n🔗 ${window.location.href}`;

  try {
    if (event.imageUrl) {
      const image = new Image();
      image.crossOrigin = "anonymous"; // Falls das Bild extern ist
      image.src = event.imageUrl;

      image.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        // Bildgröße setzen (mit zusätzlichem Platz für Blur)
        const blurSize = 20; // Größe des Blur-Rahmens
        canvas.width = image.width + blurSize * 2;
        canvas.height = image.height + blurSize * 2;

        // Hintergrund weichzeichnen
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)"; // Schattenfarbe
        ctx.shadowBlur = blurSize; // Weichzeichnung
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Bild in der Mitte platzieren
        ctx.drawImage(image, blurSize, blurSize, image.width, image.height);

        // Bild als Blob exportieren
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "event-image.jpg", {
              type: "image/jpeg",
            });

            // Teilen mit Bild
            await navigator.share({
              text: message,
              files: [file],
            });
          }
        }, "image/jpeg");
      };
    } else {
      // Fallback ohne Bild
      await navigator.share({ text: message });
    }
  } catch (error) {
    console.error("Error sharing event:", error);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }
};
