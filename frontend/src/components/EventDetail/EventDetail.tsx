import { CalendarPlus, Heart, Share2 } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { useEvent } from "../../hooks/useEvent"; // Custom Hook für Event-Fetching
import TicketButton from "../Buttons/TicketButton";
import { ImageModal } from "../ImageModal/ImageModal";
import { EventBasicInfo } from "./components/EventBasicInfo";
import { EventDescription } from "./components/EventDescription";
import { EventDetailError } from "./components/EventDetailError";
import { EventDetailSkeleton } from "./components/EventDetailSkeleton";
import { EventHero } from "./components/EventHero";
import { EventLineup } from "./components/EventLineup";
import GenreSlider from "./components/GenreSlider/GenreSlider";
import "./EventDetail.css";
import { handleWhatsAppShare } from "./service";
import Social from "./Social/Social";

export const EventDetail: React.FC = () => {
  const { eventId } = useParams();
  const { event, loading, error } = useEvent(eventId);
  const [showImageModal, setShowImageModal] = useState(false);
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useContext(UserContext);

  useEffect(() => {
    if (event) {
      // Update meta tags for social sharing
      const updateMetaTags = () => {
        // Update title
        document
          .querySelector('meta[property="og:title"]')
          ?.setAttribute("content", event.title);

        // Update description
        const description =
          event.description || `${event.title} - Event in ${event.city}`;
        document
          .querySelector('meta[property="og:description"]')
          ?.setAttribute("content", description);

        // Update image
        if (event.imageUrl) {
          document
            .querySelector('meta[property="og:image"]')
            ?.setAttribute("content", event.imageUrl);
        }

        // Update URL
        document
          .querySelector('meta[property="og:url"]')
          ?.setAttribute("content", window.location.href);
      };

      updateMetaTags();
    }
  }, [event]);

  const handleAddToCalendar = () => {
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

  if (loading) {
    return <EventDetailSkeleton />;
  }

  if (error || !event) {
    return <EventDetailError message={error?.message} />;
  }

  function handleFavoriteClick(): void {
    if (!eventId) return;

    if (isFavorite(eventId)) {
      removeFavorite(eventId);
    } else {
      addFavorite(eventId);
    }
  }

  return (
    <div
      className="event-detail"
      style={
        {
          "--event-background-image": `url(${event.imageUrl})`,
        } as React.CSSProperties
      }
    >
      <div className="share-buttons">
        <button
          onClick={handleAddToCalendar}
          className="share-button"
          title="Zum Kalender hinzufügen"
        >
          <CalendarPlus className="h-5 w-5" />
        </button>
        <button
          onClick={handleWhatsAppShare}
          className="share-button"
          title="Via WhatsApp teilen"
        >
          <Share2 className="h-5 w-5" />
        </button>
        <button
          className={`share-button ${
            isFavorite(eventId || "") ? "active" : ""
          }`}
          onClick={handleFavoriteClick}
          title={
            isFavorite(eventId || "")
              ? "Von Favoriten entfernen"
              : "Zu Favoriten hinzufügen"
          }
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite(eventId || "") ? "fill-current" : ""
            }`}
          />
        </button>
      </div>

      <EventHero
        imageUrl={event.imageUrl}
        title={event.title}
        onImageClick={() => setShowImageModal(true)}
      />
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>
      {event.tags && event.tags.length > 0 && (
        <GenreSlider genres={event.tags} />
      )}
      <div className="event-title-container">
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(
            event.title + " event"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h1 className="event-title">{event.title}</h1>
        </a>
      </div>
      <div className="event-content">
        <EventBasicInfo
          startDate={event.startDate?.toString() || ""}
          startTime={event.startTime}
          city={event.city}
          category={event.category}
        />

        <EventDescription
          title={event.title}
          description={event.description}
          price={event.price}
          ticketLink={event.ticketLink}
        />
        <TicketButton href={event.ticketLink || ""} />

        {event.lineup && event.lineup.length > 0 && (
          <EventLineup lineup={event.lineup} />
        )}

        <Social
          instagram={event.socialMediaLinks?.instagram}
          facebook={event.socialMediaLinks?.facebook}
          // tiktok={event.socialMediaLinks?.tiktok}
          // youtube={event.socialMediaLinks?.youtube}
          // soundCloud={event.socialMediaLinks?.soundCloud}
        />

        {/* {event.uploadLat && event.uploadLon && (
          <EventLocation
            lat={event.uploadLat}
            lon={event.uploadLon}
            title={event.title}
          />
        )} */}
      </div>

      {showImageModal && (
        <ImageModal
          imageUrl={event.imageUrl || ""}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};

// Unterkomponenten in separaten Dateien:
