import { Eye, Heart, MessageCircle, Send } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../contexts/UserContext";
import { DEFAULT_IMAGE, Event } from "../../../utils";
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

  console.log(event);
  return (
    <div className="real-list-item-container">
      <RealListItemProfileHeader
        profileUrl={event?.host?.profileImageUrl || event?.imageUrl || ""}
        name={event?.host?.username || ""}
        id={event?.hostId || ""}
        location={event?.city || "TBA"}
      />
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
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_IMAGE;
            }}
          />
        </div>
        <div className="miniature-event-info">
          {/* <h2 className="event-info-date"> */}
          {/* {formatDate(event.startDate as string)} */}
          {/* </h2> */}
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
            <div className="event-meta-container-left">
              <span className="views">
                <Eye size={25} />
                {event.views}
              </span>
              <span className="comments">
                <MessageCircle size={25} />
                {event.commentCount}
              </span>
            </div>
            <div className="event-meta-container-right">
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
  );
};
