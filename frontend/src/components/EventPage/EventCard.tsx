import { useNavigate } from "react-router-dom";
import { Event } from "../../utils";
import "./EventCard.css";
export const EventCard = ({ event }: { event: Event }) => {
  const navigate = useNavigate();

  const toDateString = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      onClick={() => {
        navigate(`/event/${event.id}`);
      }}
      className="event-card-container"
    >
      <div className="event-card-image-container">
        <img
          className="event-card-image"
          src={event.imageUrl}
          alt={event.title}
        />
      </div>
      <div className="event-card-info-container">
        <h3>{event.title}</h3>
        <p>{toDateString(event.startDate)}</p>
      </div>
    </div>
  );
};
