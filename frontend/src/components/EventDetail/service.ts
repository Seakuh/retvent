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
      // **Bild über Image-Element laden (Vermeidung von CORS-Problemen)**
      const image = new Image();
      image.crossOrigin = "anonymous"; // Falls CORS erlaubt wird
      image.src = event.imageUrl;

      image.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = image.width;
        const height = image.height;

        canvas.width = width;
        canvas.height = height;

        // **Hauptbild rendern**
        ctx.drawImage(image, 0, 0, width, height);

        // **Verlauf unten hinzufügen (linearer Gradient)**
        const gradientHeight = height * 0.3; // Verlauf nimmt unteren 30% ein
        const gradient = ctx.createLinearGradient(
          0,
          height - gradientHeight,
          0,
          height
        );
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)"); // Start transparent
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)"); // Ende schwarz

        ctx.fillStyle = gradient;
        ctx.fillRect(0, height - gradientHeight, width, gradientHeight);

        // **Text hinzufügen**
        ctx.fillStyle = "white";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";

        // **Titel**
        ctx.fillText(event.title, width / 2, height - gradientHeight + 40);

        // **Stadt**
        ctx.font = "italic 28px Arial";
        ctx.fillText(event.city || "", width / 2, height - gradientHeight + 80);

        // **Bild in Blob umwandeln & teilen**
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
