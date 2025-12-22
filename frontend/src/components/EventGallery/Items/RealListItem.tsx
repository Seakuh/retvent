import {
  CalendarIcon,
  CalendarPlus,
  ExternalLink,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Send,
  Star,
  TicketIcon,
} from "lucide-react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../contexts/UserContext";
import { Event, formatDate, getDaysUntilDate } from "../../../utils";
import "./RealListItem.css";
import { RealListItemDropdown } from "./RealListItemDropdown";
import { RealListItemProfileHeader } from "./RealListItemProfileHeader";

export const RealListItem: React.FC<{ event: Event; isPast?: boolean }> = ({
  event,
  isPast,
}) => {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useContext(UserContext);
  const [showLineup, setShowLineup] = useState(false);
  const handleLike = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Verhindert das Navigieren zur Event-Detailseite

    if (isFavorite(event.id!)) {
      // Nutze isFavorite statt lokalem State
      removeFavorite(event.id!);
    } else {
      addFavorite(event.id!);
    }
    // setIsLiked nicht nötig, da wir isFavorite vom Context nutzen
  };

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
      `${event.title} | \nhttps://event-scanner.com/event/${event.id}\n\n` +
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

  const shareEventId = (
    e: React.MouseEvent<HTMLDivElement>,
    eventId: string
  ) => {
    e.preventDefault();
    e.stopPropagation(); // Verhindert das Navigieren zur Event-Detailseite

    const shareUrl = `https://event-scanner.com/event/${eventId}`;

    if (navigator.share) {
      // For mobile devices that support Web Share API
      navigator.share({
        url: shareUrl,
      });
    } else {
      // Fallback for desktop browsers
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          // Could show a toast/notification here that URL was copied
          alert("Link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
        });
    }
  };

  const handleLineupClick = () => {
    setShowLineup(!showLineup);
  };

  const renderLineup = (event: Event) => {
    console.log(event.lineup);
    if (!event.lineup || event.lineup.length === 0) {
      return (
        <div className="lineup-container" onClick={handleLineupClick}>
          <div className="lineup-content">
            <h2 className="lineup-title">Lineup</h2>
            <p className="no-lineup">no lineup</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="lineup-container-real-list-item"
        onClick={handleLineupClick}
      >
        <div className="lineup-content-real-list-item">
          <h2 className="lineup-title">Lineup</h2>
          <div className="artists-list">
            {event.lineup.map((artist, index) => (
              <div key={index} className="artist-item">
                <div className="artist-info-container">
                  <span className="artist-name">{artist.name}</span>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      artist.name + " " + artist.role || " DJ"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linup-search-link"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
                {artist.startTime && (
                  <span className="artist-time">{artist.startTime}</span>
                )}
                {artist.role && (
                  <span className="artist-role">{artist.role}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`real-list-item-container ${
        event.isSponsored ? "real-sponsored-list-item" : ""
      }`}
    >
      <div
        key={event.id || event._id}
        className={`real-event-list-item ${isPast ? "past-event" : ""}`}
        onClick={() => navigate(`/event/${event.id || event._id}`)}
      >
        <div className="real-list-item-profile-header-container" style={{ position: "relative" }}>
          <RealListItemProfileHeader
            profileUrl={event?.host?.profileImageUrl || event?.imageUrl || ""}
            name={event?.host?.username || ""}
            id={event?.hostId || ""}
            location={event?.city || "TBA"}
          />
          <div style={{ position: "absolute", right: 12, top: 10, zIndex: 2 }}>
            <RealListItemDropdown
              eventId={event.id || event._id || ""}
              onShare={shareEventId}
            />
          </div>
        </div>
      <h1 className="event-info-title-headline">{event.title}</h1>
        <div className="real-event-thumbnail">
          <img
            src={`https://img.event-scanner.com/insecure/rs:fit:935/q:70/plain/${event.imageUrl}@webp`}
            alt={event.title}
            loading="lazy"
            decoding="async"
          />
        </div>


        <div className="event-meta-container">
          <div className="event-meta-container-left">
            <div
              onClick={(e) => handleLike(e)}
              className="event-card-like-container"
            >
              <Heart
                size={20}
                color={isFavorite(event.id!) ? "red" : "white"}
                fill={isFavorite(event.id!) ? "red" : "none"}
              />
            </div>
            <span className="">
              <Eye size={20} />
              {event.views}
            </span>
            <span className="comments">
              <MessageCircle size={20} />
              {event.commentCount}
            </span>
          </div>
          <div onClick={(e) => shareEventId(e, event.id!)}>
            <Send size={20} color={"white"} />
          </div>
        </div>

        <div className="real-list-item-location-date-container">
          <span className="real-list-item-location">
            <MapPin size={14} color="white" />
            {event?.city || "TBA"}
          </span>
          <span className="real-list-item-date">
            <CalendarIcon size={16} color="white" />
            {(() => {
              try {
                if (!event.startDate) {
                  throw new Error("No start date available");
                }

                const formattedDate = formatDate(event.startDate as string);
                const days = getDaysUntilDate(formattedDate);

                return (
                  <>
                    {formattedDate}{" "}
                    {days === 0
                      ? "| today"
                      : days === 1
                      ? "| tomorrow"
                      : days === -1
                      ? "| yesterday"
                      : days < 0
                      ? `| ${Math.abs(days)} days ago`
                      : `| in ${days} days`}
                  </>
                );
              } catch (error) {
                console.error("Error while formatting date:", error);
                return <span>No date available</span>;
              }
            })()}
          </span>
        </div>

        <div className="miniature-event-info">
          <h2 className="event-description-real-list-item">
            {event.description}
          </h2>

          <div className="event-info-button-container">
            <button
              className="lineup-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(
                  `https://google.com/search?q=${encodeURIComponent(
                    event.title + " ticket"
                  )}`
                );
              }}
              title="Lineup anzeigen"
            >
              <TicketIcon size={24} />
              <span>Tickets</span>
            </button>
            {/* Lineup Button for Desktop */}
            {event.lineup && event.lineup.length > 0 && (
              <button
                className="lineup-button"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLineupClick();
                }}
                title="Lineup anzeigen"
              >
                <Star size={24} />
                <span>Artists</span>
              </button>
            )}
            <button
              className="lineup-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCalendar();
              }}
              title="Add to Calendar"
            >
              <CalendarPlus
                size={20}
                color={"white"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCalendar();
                }}
              />
              <span>Save</span>
            </button>
          </div>
    
          {/* <div className="event-tags-real-list-item">
          {event.tags?.map((tag) => (
            <span key={tag} className="event-tag">
              {tag.toLowerCase()}
            </span>
          ))}
        </div> */}
          {/* <span className="real-list-item-location">
            <MapPin size={16} />
            {event.city || "TBA"}
          </span> */}
        </div>
      </div>
      {showLineup && renderLineup(event)}
    </div>
  );
};
