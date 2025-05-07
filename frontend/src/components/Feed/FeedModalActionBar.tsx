import { ArrowRight, Heart, Send } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import "./FeedModalActionBar.css";

export const FeedModalActionBar = ({ eventId }: { eventId: string }) => {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useContext(UserContext);

  const handleLike = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Verhindert das Navigieren zur Event-Detailseite

    if (!eventId) return;

    if (isFavorite(eventId)) {
      // Nutze isFavorite statt lokalem State
      removeFavorite(eventId);
    } else {
      addFavorite(eventId);
    }
    // setIsLiked nicht nötig, da wir isFavorite vom Context nutzen
  };

  return (
    <div className="feed-modal-action-bar">
      <div className="feed-modal-action-bar-left">
        {/* <button className="feed-modal-action-bar-left-button">
          <CalendarPlus size={25} color="white" />
        </button> */}
        <button
          className="go-to-event-button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/event/${eventId}`);
          }}
        >
          <ArrowRight color="white" />
        </button>
      </div>
      <div className="feed-modal-action-bar-center"></div>
      <div className="feed-modal-action-bar-right">
        <button
          className={`add-to-favorites-button ${
            isFavorite(eventId) ? "liked" : ""
          }`}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            handleLike(e as unknown as React.MouseEvent<HTMLDivElement>);
          }}
        >
          <Heart
            color={isFavorite(eventId) ? "red" : "white"}
            fill={isFavorite(eventId) ? "red" : "none"}
          />
        </button>
        <button className="feed-modal-share-button">
          <Send size={25} color="white" />
        </button>
      </div>
    </div>
  );
};
