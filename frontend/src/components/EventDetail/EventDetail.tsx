import { CalendarPlus, Heart, Share2 } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { useEvent } from "../../hooks/useEvent"; // Custom Hook für Event-Fetching
import TicketButton from "../Buttons/TicketButton";
import CommentSection from "../Comment/CommentSection";
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
    window.scrollTo(0, 0); // Falls die Seite nicht ganz oben startet
  }, [location.pathname]);

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

  const HelmetMeta = () => {
    return (
      <Helmet>
        <title>{event.title}</title>
        <meta name="description" content={event.description} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description} />
        <meta property="og:image" content={event.imageUrl} />
        <meta
          property="og:url"
          content={`https://event-scanner.com/event/${eventId}`}
        />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={event.title} />
        <meta property="twitter:description" content={event.description} />
        <meta property="twitter:image" content={event.imageUrl} />
        <meta property="og:image:alt" content={event.title} />
        <meta
          property="twitter:url"
          content={`https://event-scanner.com/event/${eventId}`}
        />
      </Helmet>
    );
  };

  return (
    <div>
      {event && <HelmetMeta />}
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
            onClick={() => handleWhatsAppShare(event)}
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
        <button
          className="back-button"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              if (event.category) {
                navigate(`/category/${event.category}`);
              } else {
                navigate("/");
              }
            }
          }}
        >
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

          {event.lineup && event.lineup.length > 0 && (
            <EventLineup lineup={event.lineup} />
          )}

          {/* {event.uploadLat && event.uploadLon && (
        <EventLocation
        lat={event.uploadLat}
        lon={event.uploadLon}
        title={event.title}
        />
        )} */}
          <CommentSection eventId={eventId || ""} />
          <TicketButton href={event.ticketLink || ""} />
          <Social
            instagram={event.socialMediaLinks?.instagram}
            facebook={event.socialMediaLinks?.facebook}
            // tiktok={event.socialMediaLinks?.tiktok}
            // youtube={event.socialMediaLinks?.youtube}
            // soundCloud={event.socialMediaLinks?.soundCloud}
          />
        </div>

        {showImageModal && (
          <ImageModal
            imageUrl={event.imageUrl || ""}
            onClose={() => setShowImageModal(false)}
          />
        )}
      </div>
    </div>
  );
};

// Unterkomponenten in separaten Dateien:
