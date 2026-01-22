/**
 * JSON-LD Strukturierte Daten für Events
 * Optimiert für Google Rich Results, Discover & AI Overviews
 */

import { Helmet } from "react-helmet-async";
import { Event, getEventUrl } from "../../utils";

interface EventStructuredDataProps {
  event: Event;
  eventId: string;
}

export const EventStructuredData: React.FC<EventStructuredDataProps> = ({
  event,
  eventId,
}) => {
  if (!event) return null;

  // Verwende getEventUrl für konsistente URL-Generierung
  const eventUrl = getEventUrl(event);
  const fullUrl = `https://event-scanner.com${eventUrl}`;

  // Formatierung der Daten
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toISOString();
  };

  const formatDateTime = (date: Date | string | undefined, time?: string): string => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const [hours, minutes] = time ? time.split(":") : ["00", "00"];
    dateObj.setHours(parseInt(hours), parseInt(minutes));
    return dateObj.toISOString();
  };

  // Event Schema
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": fullUrl,
    name: event.title,
    description: event.description || event.title,
    image: event.imageUrl ? [event.imageUrl] : undefined,
    startDate: formatDateTime(event.startDate, event.startTime),
    endDate: event.endDate
      ? formatDateTime(event.endDate, event.endTime)
      : undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: event.location
      ? {
          "@type": "Place",
          name: event.venue?.name || event.city || "TBA",
          address: event.address
            ? {
                "@type": "PostalAddress",
                streetAddress: event.address.street
                  ? `${event.address.street} ${event.address.houseNumber || ""}`.trim()
                  : undefined,
                addressLocality: event.city || event.address.city,
                postalCode: event.address.postalCode,
                addressCountry: event.address.country || "DE",
              }
            : {
                "@type": "PostalAddress",
                addressLocality: event.city,
                addressCountry: "DE",
              },
          geo: event.location.coordinates
            ? {
                "@type": "GeoCoordinates",
                latitude: event.location.coordinates[1],
                longitude: event.location.coordinates[0],
              }
            : undefined,
        }
      : {
          "@type": "Place",
          name: event.city || "TBA",
          address: {
            "@type": "PostalAddress",
            addressLocality: event.city,
            addressCountry: "DE",
          },
        },
    organizer: event.host
      ? {
          "@type": "Organization",
          name: event.host.username,
          url: `https://event-scanner.com/profile/${event.hostId}`,
        }
      : {
          "@type": "Organization",
          name: "EventScanner",
          url: "https://event-scanner.com",
        },
    offers: event.ticketLink
      ? {
          "@type": "Offer",
          url: event.ticketLink,
          price: event.price || "0",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          validFrom: formatDate(event.createdAt),
        }
      : undefined,
    performer:
      event.lineup && event.lineup.length > 0
        ? event.lineup.map((member) => ({
            "@type": "MusicGroup",
            name: member.name,
          }))
        : undefined,
  };

  // InteractionCounter Schema (Community-Signale)
  const interactionSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": fullUrl,
    name: event.title,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: event.commentCount || 0,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: event.likeIds?.length || 0,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ViewAction",
        userInteractionCount: event.views || 0,
      },
    ],
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://event-scanner.com",
      },
      ...(event.city
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: event.city,
              item: `https://event-scanner.com/events/${event.city.toLowerCase()}`,
            },
          ]
        : []),
      ...(event.category
        ? [
            {
              "@type": "ListItem",
              position: event.city ? 3 : 2,
              name: event.category,
              item: `https://event-scanner.com/events/${event.city?.toLowerCase()}/${event.category.toLowerCase()}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position:
          (event.city ? 1 : 0) + (event.category ? 1 : 0) + 2,
        name: event.title,
        item: fullUrl,
      },
    ],
  };

  return (
    <Helmet>
      {/* Event Schema */}
      <script type="application/ld+json">
        {JSON.stringify(eventSchema)}
      </script>

      {/* InteractionCounter Schema */}
      {(event.commentCount || event.likeIds?.length || event.views) && (
        <script type="application/ld+json">
          {JSON.stringify(interactionSchema)}
        </script>
      )}

      {/* BreadcrumbList Schema */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
};
