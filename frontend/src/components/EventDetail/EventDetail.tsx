import { CalendarPlus, Heart, Share2 } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { useEvent } from "../../hooks/useEvent"; // Custom Hook für Event-Fetching
import CommentSection from "../Comment/CommentSection";
import { ImageModal } from "../ImageModal/ImageModal";
import { EventBasicInfo } from "./components/EventBasicInfo";
import { EventDescription } from "./components/EventDescription";
import { EventDetailError } from "./components/EventDetailError";
import { EventDetailSkeleton } from "./components/EventDetailSkeleton";
import { EventHero } from "./components/EventHero";
import { EventHost } from "./components/EventHost";
import { EventLineup } from "./components/EventLineup";
import { EventTags } from "./components/EventTags";
import "./EventDetail.css";
import { shareEvent } from "./service";
export const EventDetail: React.FC = () => {
  const { eventId } = useParams();
  const { event, loading, error, host } = useEvent(eventId);
  const [showImageModal, setShowImageModal] = useState(false);
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useContext(UserContext);

  useEffect(() => {
    window.scrollTo(0, 0); // Falls die Seite nicht ganz oben startet
  }, [location.pathname]);

  useEffect(() => {
    if (event) {
      document.title = `${event.title} | EventScanner`;
    }
  }, [event]);

  const handleAddToCalendar = () => {
    if (!event?.startDate) return;

    const formatDate = (date: string) => {
      return date.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    };

    const startDate = new Date(event.startDate);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 5);

    // Format: YYYYMMDDTHHMMSSZ
    const formattedStart = formatDate(startDate.toISOString());
    const formattedEnd = formatDate(endDate.toISOString());

    const description =
      `${event.title} | \nhttps://event-scanner.com/event/${eventId}\n\n` +
      "\n-----------------------\nDescription\n" +
      event.description +
      " " +
      (event.lineup
        ? "\n-----------------------\nLineup:\n" +
          event.lineup.map((artist) => artist.name).join("\n")
        : "");

    let location = "";
    if (event.address) {
      location =
        event.address.city +
        " " +
        event.address.street +
        " " +
        event.address.houseNumber;
    } else if (event.city) {
      location = event.city;
    }

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${formattedStart}/${formattedEnd}&details=${encodeURIComponent(
      description
    )}&location=${encodeURIComponent(location)}`;

    window.open(googleCalendarUrl, "_blank");
  };

  function handleFavoriteClick(): void {
    if (!eventId) return;

    if (isFavorite(eventId)) {
      removeFavorite(eventId);
    } else {
      addFavorite(eventId);
    }
  }

  const HelmetMeta = () => {
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
          content={`https://event-scanner.com/event/${eventId}`}
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
          content={`https://event-scanner.com/event/${eventId}`}
        />

        {/* Additional Meta Tags */}
        <meta name="author" content="EventScanner" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <link
          rel="canonical"
          href={`https://event-scanner.com/event/${eventId}`}
        />
      </Helmet>
    );
  };

  if (loading) {
    return <EventDetailSkeleton />;
  }

  if (error || !event) {
    return <EventDetailError message={error?.message} />;
  }

  return (
    <div>
      <HelmetMeta />
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
            title="Add to Calendar"
          >
            <CalendarPlus className="h-5 w-5" />
          </button>
          <button
            onClick={() => shareEvent(event)}
            className="share-button"
            title="Share Event"
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
                ? "Remove from Favorites"
                : "Add to Favorites"
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
        {/* <CommunitySection
          views={event.views ?? 0}
          commentCount={event.commentCount ?? 0}
          city={event.city ?? ""}
        /> */}
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

        <div className="event-content">
          <div className="event-important-info-contain">
            <div className="event-title-container">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  event.title + " event"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <h1 className="event-title-detail">{event.title}</h1>
              </a>
            </div>
            <EventBasicInfo
              startDate={event.startDate?.toString() || ""}
              startTime={event.startTime}
              city={event.city}
              category={event.category}
              address={event.address}
              handleAddToCalendar={handleAddToCalendar}
            />
          </div>

          <EventDescription
            title={event.title}
            description={event.description}
            price={event.price}
            ticketLink={event.ticketLink}
          />
          {host && <EventHost host={host} userId={event.hostId || ""} />}

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
          {/* <TicketButton href={event.ticketLink || ""} />
          <Social
            instagram={event.socialMediaLinks?.instagram}
            facebook={event.socialMediaLinks?.facebook}
            // tiktok={event.socialMediaLinks?.tiktok}
            // youtube={event.socialMediaLinks?.youtube}
            // soundCloud={event.socialMediaLinks?.soundCloud}
          /> */}
          {event.tags && event.tags.length > 0 && (
            <EventTags tags={event.tags} />
          )}
        </div>

        {showImageModal && (
          <ImageModal
            imageUrl={event.imageUrl || ""}
            onClose={() => setShowImageModal(false)}
          />
        )}
        <div className="event-detail-footer">
          <p className="">
            This event was submitted by a user. The content does not originate
            from Event-Scanner or the event organizer.
          </p>
          <p className="">
            If you are the rights holder and would like this content removed,
            <br />
            please{" "}
            <a
              onClick={() => navigate("/imprint")}
              className=" contact-link underline"
            >
              contact us here
            </a>
          </p>
        </div>
      </div>
      <CommentSection eventId={eventId || ""} />
    </div>
  );
};

// Unterkomponenten in separaten Dateien:
