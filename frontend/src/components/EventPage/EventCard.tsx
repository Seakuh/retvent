import { Eye, Heart, MessageCircle, Send } from "lucide-react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { Event } from "../../utils";
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
  const shareEventId = (
    e: React.MouseEvent<HTMLDivElement>,
    eventId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      url: `https://event-scanner.com/event/${eventId}`,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .catch((error) => console.log("Fehler beim Teilen:", error));
    } else {
      // Fallback für Browser ohne Web Share API
      navigator.clipboard
        .writeText(shareData.url)
        .then(() => {
          alert("Saved to clipboard!");
        })
        .catch(() => {
          alert("Error saving to clipboard");
        });
    }
  };
  return (
    <div
      onClick={() => {
        navigate(`/event/${event.id || event._id}`);
      }}
      className={`event-card-container card-${event.id}`}
    >
      <RealListItemProfileHeader
        profileUrl={event.host?.profileImageUrl ?? event.imageUrl ?? ""}
        name={event.host?.username ?? ""}
        id={event.hostId ?? ""}
        location={event.city ?? "TBA"}
      />
      <div className="event-card-image-container">
        <img
          className="event-card-image"
          loading="lazy"
          decoding="async"
          src={`https://img.event-scanner.com/insecure/rs:fill:320:350/q:70/plain/${event.imageUrl}@webp`}
          alt={event.title}
        />
      </div>
      <div className="event-card-info-container">
        <span className="event-card-date">
          {formatDate(event.startDate as string)}
        </span>
        <h3 className="event-card-title">{event.title}</h3>
        <div className="event-card-description">{event.description}</div>
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
                <div onClick={(e) => shareEventId(e, event.id!)}>
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
