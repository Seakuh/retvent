import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEvent } from "../../hooks/useEvent"; // Custom Hook für Event-Fetching
import TicketButton from "../Buttons/TicketButton";
import { ImageModal } from "../ImageModal/ImageModal";
import { EventBasicInfo } from "./components/EventBasicInfo";
import { EventDescription } from "./components/EventDescription";
import { EventDetailError } from "./components/EventDetailError";
import { EventDetailSkeleton } from "./components/EventDetailSkeleton";
import { EventHero } from "./components/EventHero";
import { EventLineup } from "./components/EventLineup";
import { EventLocation } from "./components/EventLocation";
import "./EventDetail.css";
import Social from "./Social/Social";

export const EventDetail: React.FC = () => {
  const { eventId } = useParams();
  const { event, loading, error } = useEvent(eventId);
  const [showImageModal, setShowImageModal] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return <EventDetailSkeleton />;
  }

  if (error || !event) {
    return <EventDetailError message={error?.message} />;
  }

  return (
    <div
      className="event-detail"
      style={
        {
          "--event-background-image": `url(${event.imageUrl})`,
        } as React.CSSProperties
      }
    >
      <EventHero
        imageUrl={event.imageUrl}
        title={event.title}
        onImageClick={() => setShowImageModal(true)}
      />
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back
      </button>
      <div className="event-title-container">
        <h1 className="event-title">{event.title}</h1>
      </div>
      <div className="event-content">
        <EventBasicInfo
          startDate={event.startDate || ""}
          startTime={event.startTime}
          city={event.city}
          category={event.category}
        />

        <EventDescription
          title={event.title}
          description={event.description}
          price={event.price}
          ticketLink={event.ticketLink}
        />
        <TicketButton href={event.ticketLink || ""} />

        {event.lineup && event.lineup.length > 0 && (
          <EventLineup lineup={event.lineup} />
        )}

        <Social
          instagram={event.socialMediaLinks?.instagram}
          facebook={event.socialMediaLinks?.facebook}
          // tiktok={event.socialMediaLinks?.tiktok}
          // youtube={event.socialMediaLinks?.youtube}
          // soundCloud={event.socialMediaLinks?.soundCloud}
        />

        {event.uploadLat && event.uploadLon && (
          <EventLocation
            lat={event.uploadLat}
            lon={event.uploadLon}
            title={event.title}
          />
        )}
      </div>

      {showImageModal && (
        <ImageModal
          imageUrl={event.imageUrl || ""}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};

// Unterkomponenten in separaten Dateien:
