import { Eye, Heart, MessageCircle, Send } from "lucide-react";
import { useContext, useRef, useState } from "react";
import { UserContext } from "../../../contexts/UserContext";
import { Event } from "../../../utils";
import { shareEvent } from "../service";
import "./MetaBar.css";
export const MetaBar = (event: Event) => {
  const [isLiked, setIsLiked] = useState(false);
  const { addFavorite, removeFavorite, isFavorite } = useContext(UserContext);
  const scrollToComments = useRef<HTMLDivElement>(null);
  const handleLike = () => {
    if (isLiked) {
      removeFavorite(event.id!);
    } else {
      addFavorite(event.id!);
    }
    setIsLiked(!isLiked);
  };

  return (
    <div className="event-detail-meta-bar">
      
      <div className="community-intercation">
            {/* like */}
            <div className="event-detail-meta-bar-item">
          <div className="event-detail-meta-bar-item-icon">
            <Heart
              onClick={handleLike}
              color={isFavorite(event.id!) ? "red" : "white"}
              fill={isFavorite(event.id!) ? "red" : "none"}
            />
          </div>
        </div>
        {/* views */}
        <div className="event-detail-meta-bar-item">
          <div className="event-detail-meta-bar-item-icon views-meta-bar-icon">
            <Eye />
            <p>{event.views || 0}</p>
          </div>
        </div>
        {/* comments */}
        <div className="event-detail-meta-bar-item">
          <div
            className="event-detail-meta-bar-item-icon comments-meta-bar-icon"
            onClick={() => {
              document.querySelector(".comment-section")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            <MessageCircle />
            <p>{event.commentCount || 0}</p>
          </div>
        </div>
      </div>
      <div className="user-interaction">
        {/* share */}
        <div className="event-detail-meta-bar-item">
          <div
            className="event-detail-meta-bar-item-icon"
            onClick={(e) => shareEvent(e, event)}
          >
            <Send />
          </div>
        </div>
    
      </div>
    </div>
  );
};
