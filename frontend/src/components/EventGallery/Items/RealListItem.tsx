import { Eye, Heart, MessageCircle } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../contexts/UserContext";
import { Event } from "../../../utils";
import "./RealListItem.css";
import { RealListItemProfileHeader } from "./RealListItemProfileHeader";

export const RealListItem: React.FC<{ event: Event; isPast?: boolean }> = ({
  event,
  isPast,
}) => {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useContext(UserContext);

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
    e.stopPropagation(); // Verhindert das Navigieren zur Event-Detailseite
    const shareData = {
      url: `https://event-scanner.com/event/${eventId}`,
    };
    navigator.share(shareData);
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
        <div className="real-event-thumbnail">
          <img
            src={`https://img.event-scanner.com/insecure/rs:fit:935/q:70/plain/${event.imageUrl}@webp`}
            alt={event.title}
            loading="lazy"
            decoding="async"
          />
        </div>
        <RealListItemProfileHeader
          profileUrl={event?.host?.profileImageUrl || event?.imageUrl || ""}
          name={event?.host?.username || ""}
          id={event?.hostId || ""}
          location={event?.city || "TBA"}
        />
        <div className="miniature-event-info">
          {/* <h2 className="event-info-date"> */}
          {/* {formatDate(event.startDate as string)} */}
          {/* </h2> */}
          {/* <span className="event-card-date">
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
          </span> */}
          <h1 className="event-info-title-headline">{event.title}</h1>
          <h2 className="event-description-real-list-item">
            {event.lineup && event.lineup.length > 0
              ? event.lineup.map((artist) => artist.name).join(" ")
              : event.description}
          </h2>
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
          <div className="event-meta-container">
            <div className="event-meta-container-right">
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
            </div>
            <div className="event-meta-container-left">
              <span className="views">
                <Eye size={20} />
                {event.views}
              </span>
              <span className="comments">
                <MessageCircle size={20} />
                {event.commentCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
