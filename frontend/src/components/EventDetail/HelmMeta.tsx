import { Helmet } from "react-helmet-async";
import { Event } from "../../utils";
interface HelmetMetaProps {
  event: Event;
  eventId: string;
}

const HelmetMeta = ({ event, eventId }: HelmetMetaProps) => {
  if (!event) return null;
  const formattedDate = event.startDate
    ? new Date(event.startDate).toLocaleDateString("de-DE")
    : "";
  const description = `${event.title} - ${formattedDate} in ${
    event.city || "TBA"
  }. ${event.description || ""}`;

  return (
    <Helmet>
      <title>{event.title} | EventScanner</title>
      <meta name="description" content={description} />
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#000000" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={event.title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={event.imageUrl} />
      <meta
        property="og:url"
        content={`https://event-scanner.com/event/${
          (event as any).slug 
            ? `${(event as any).slug}-${eventId}` 
            : eventId
        }`}
      />
      <meta property="og:site_name" content="EventScanner" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@eventscanner" />
      <meta name="twitter:title" content={event.title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={event.imageUrl} />
      <meta
        name="twitter:url"
        content={`https://event-scanner.com/event/${
          (event as any).slug 
            ? `${(event as any).slug}-${eventId}` 
            : eventId
        }`}
      />

      {/* Additional Meta Tags */}
      <meta name="author" content="EventScanner" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <link
        rel="canonical"
        href={`https://event-scanner.com/event/${
          (event as any).slug 
            ? `${(event as any).slug}-${eventId}` 
            : eventId
        }`}
      />
    </Helmet>
  );
};

export default HelmetMeta;
