import { Eye, Heart, MessageCircle, Send } from "lucide-react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { Event, getDaysUntilDate, getEventUrl } from "../../utils";
import { RealListItemProfileHeader } from "../EventGallery/Items/RealListItemProfileHeader";
import "./EventCard.css";
export const EventCard = ({ event }: { event: Event }) => {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useContext(UserContext);
  const [isLiked, setIsLiked] = useState(false);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d
      .toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      })
      .toUpperCase();
  };

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
  // Hilfsfunktion für "Copied" Meldung
  const showCopiedMessage = () => {
    const message = document.createElement("div");
    message.textContent = "Copied";
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #000;
      color: #fff;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: fadeInOut 2s ease-in-out;
    `;
    
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-10px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
      style.remove();
    }, 2000);
  };

  const shareEventId = async (
    e: React.MouseEvent<HTMLDivElement>,
    event: Event
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const eventUrl = getEventUrl(event);
    const shareUrl = `https://event-scanner.com${eventUrl}`;
    const shareData = {
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        showCopiedMessage();
      }
    } catch (error) {
      // Wenn Share fehlschlägt, copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        showCopiedMessage();
      } catch (clipboardError) {
        console.error("Failed to copy to clipboard:", clipboardError);
      }
    }
  };
  return (
    <div
      onClick={() => {
        navigate(getEventUrl(event));
      }}
      className={`${
        event.isSponsored ? "sponsored-card" : ""
      } event-card-container card-${event.id}`}
    >
      <div className="event-card-image-container">
        <img
          className="event-card-image"
          loading="lazy"
          decoding="async"
          src={`https://img.event-scanner.com/insecure/rs:fill:320:350/q:70/plain/${event.imageUrl}@webp`}
          alt={event.title}
        />
      </div>
      <RealListItemProfileHeader
        profileUrl={event.host?.profileImageUrl ?? event.imageUrl ?? ""}
        name={event.host?.username ?? ""}
        id={event.hostId ?? ""}
        location={event.city ?? "TBA"}
      />
      <div className="event-card-info-container">
        <h3 className="event-card-title">{event.title}</h3>

        <span className="event-card-date">
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

        {event.lineup && event.lineup.length > 0 ? (
          <div className="event-card-lineup">
            {event.lineup.map((artist) => (
              <p key={artist.name}>{artist.name}</p>
            ))}
          </div>
        ) : (
          <div className="event-card-lineup">
            <p>{event.description}</p>
          </div>
        )}
        {/* <div className="event-card-description">{event.description}</div> */}
        {/* <div className="event-tags-real-list-item event-card-tags">
          {event.tags?.map((tag) => (
            <span key={tag} className="event-tag">
              {tag.toLowerCase()}
            </span>
          ))}
        </div> */}
        <div className="event-card-location-container">
          {/* <MapPin size={25} />
          <p>{event.city || "TBA"}</p> */}
        </div>
        <div className="event-card-details">
          <div className="event-card-community-container">
            <div className="event-card-community-container-left">
              <div className="event-card-views-container">
                <Eye size={25} />
                <p>{event.views || 0}</p>
              </div>
              <div className="event-card-comments-container">
                <MessageCircle size={25} />
                <p>{event.commentCount || 0}</p>
              </div>
            </div>
            <div className="event-card-user-interaction">
              <div className="event-card-user-interaction-right">
                <div onClick={(e) => shareEventId(e, event)}>
                  <Send size={25} color="white" />
                </div>
                <div
                  onClick={(e) => handleLike(e)}
                  className="event-card-like-container"
                >
                  <Heart
                    size={25}
                    color={isFavorite(event.id!) ? "red" : "white"}
                    fill={isFavorite(event.id!) ? "red" : "none"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
