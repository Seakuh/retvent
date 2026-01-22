import { Eye, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Event, formatDate, getEventUrl } from "../../../utils";
import { RealListItemProfileHeader } from "./RealListItemProfileHeader";
const DEFAULT_IMAGE =
  "https://images.vartakt.com/images/events/66e276a6-090d-4774-bc04-9f66ca56a0be.png";

interface EventListItemProps {
  event: Event;
  isPast?: boolean;
}

export const EventListItem: React.FC<EventListItemProps> = ({
  event,
  isPast,
}) => {
  const navigate = useNavigate();

  return (
    <div
      key={event.id}
      className={`event-list-item ${isPast ? "past-event" : ""}`}
      onClick={() => navigate(getEventUrl(event))}
    >
      <RealListItemProfileHeader
        profileUrl={event.hostImageUrl || event.imageUrl || ""}
        name={event.hostUsername || ""}
        id={event.hostId || ""}
        location={event.city || ""}
      />
      <div className="event-thumbnail">
        <img
          src={event.imageUrl || DEFAULT_IMAGE}
          alt={event.title}
          loading="lazy"
        />
      </div>
      <div className="miniature-event-info">
        <h2 className="event-info-date">
          {formatDate(event.startDate as string)}
        </h2>
        <h1 className="event-info-title-headline">{event.title}</h1>
        <div className="event-meta-container">
          <div className="event-meta-container-right">
            <span className="comments">
              <MessageCircle size={16} />
              {event.commentCount}
            </span>
            <span className="views">
              <Eye size={16} />
              {event.views}
            </span>

            {/* <span className="location">
              <MapPin size={16} />
              {event.city || "TBA"}
            </span> */}
          </div>
        </div>
      </div>
    </div>
  );
};
