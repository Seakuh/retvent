import { Eye, Heart, MessageCircle, Send } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
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
  const [eventPictures, setEventPictures] = useState<string[]>([]);

  useEffect(() => {
    console.log(event.lineupPictureUrl);
    if (event.lineupPictureUrl && event.lineupPictureUrl.length > 0) {
      setEventPictures(
        [
          event.imageUrl || "",
          ...event.lineupPictureUrl,
          event.host.profileImageUrl,
        ].filter(Boolean)
      );

      console.log(eventPictures);
    } else {
      setEventPictures([event.imageUrl || ""].filter(Boolean));
    }
  }, [event]);

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

  const sliderSettings = {
    dots: eventPictures.length > 1,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: eventPictures.length > 1,
    swipeToSlide: true,
    className: "event-slider",
    adaptiveHeight: true,
    nextArrow: <div className="slick-next">›</div>,
    prevArrow: <div className="slick-prev">‹</div>,
  };

  // Verhindere Navigation beim Klick auf den Slider
  const handleSliderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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
        <div className="real-event-thumbnail" onClick={handleSliderClick}>
          {eventPictures.length > 1 ? (
            <Slider {...sliderSettings}>
              {eventPictures.map((picture, index) => (
                <div key={index} className="slider-image-container">
                  <img
                    src={`https://img.event-scanner.com/insecure/rs:fit:935/q:70/plain/${picture}@webp`}
                    alt={event.title}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </Slider>
          ) : (
            <img
              src={`https://img.event-scanner.com/insecure/rs:fit:935/q:70/plain/${event.imageUrl}@webp`}
              alt={event.title}
              loading="lazy"
              decoding="async"
              onClick={() => navigate(`/event/${event.id || event._id}`)}
            />
          )}
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
