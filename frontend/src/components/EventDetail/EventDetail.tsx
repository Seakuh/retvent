import { ChevronLeft, MoreVertical, Pencil, Users, ImagePlus, Film, Megaphone, X, Edit } from "lucide-react";
import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { useEvent } from "../../hooks/useEvent"; // Custom Hook für Event-Fetching
import CommentSection from "../Comment/CommentSection";
import { CommunityBar } from "../CommunityDetailBar/CommunityBar";
import { ImageModal } from "../ImageModal/ImageModal";
import { EventBasicInfo } from "./components/EventBasicInfo";
import { EventDescription } from "./components/EventDescription";
import { EventDetailError } from "./components/EventDetailError";
import { EventDetailSkeleton } from "./components/EventDetailSkeleton";
import { EventGroups } from "./components/EventGroups";
import { EventHero } from "./components/EventHero";
import { EventHost } from "./components/EventHost";
import { EventLineup } from "./components/EventLineup";
import { EventTags } from "./components/EventTags";
import { MetaBar } from "./components/MetaBar";
import { HostView } from "./components/OwnerComponent/HostView";
import "./EventDetail.css";
import HelmetMeta from "./HelmMeta";
import { EventStructuredData } from "./EventStructuredData";
import { SimilarEvents } from "./SimilarEvents";
import { TicketLinkButton } from "../TicketLink/TicketLinkButton";
import Footer from "../../Footer/Footer";
import { parseEventUrl, getEventUrl } from "../../utils";

const EVENT_HISTORY_KEY = "recentEvents";
const MAX_HISTORY_SIZE = 20;

const saveEventToHistory = (eventId: string) => {
  try {
    const existingHistory = localStorage.getItem(EVENT_HISTORY_KEY);
    let history: string[] = existingHistory ? JSON.parse(existingHistory) : [];

    // Entferne die Event-ID, falls sie bereits existiert
    history = history.filter((id) => id !== eventId);

    // Füge die Event-ID am Anfang hinzu
    history.unshift(eventId);

    // Begrenze die Liste auf MAX_HISTORY_SIZE
    history = history.slice(0, MAX_HISTORY_SIZE);

    // Speichere die aktualisierte Liste
    localStorage.setItem(EVENT_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save event to history:", error);
  }
};

export const EventDetail: React.FC = () => {
  const { slugAndId } = useParams<{ slugAndId: string }>();
  const { user } = useContext(UserContext);
  
  // Parse slugAndId Parameter (kann slug-shortId oder nur eventId sein)
  const parsedUrl = slugAndId ? parseEventUrl(slugAndId) : null;
  const eventIdentifier = slugAndId || '';
  
  const { event, loading, error, host } = useEvent(eventIdentifier);
  const [showImageModal, setShowImageModal] = useState(false);
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useContext(UserContext);
  const [isOwner, setIsOwner] = useState(false);
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const ownerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0); // Falls die Seite nicht ganz oben startet
  }, [location.pathname]);

  // Close owner menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ownerMenuRef.current && !ownerMenuRef.current.contains(event.target as Node)) {
        setShowOwnerMenu(false);
      }
    };

    if (showOwnerMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOwnerMenu]);

  const handleFileUpload = (type: string) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = type === "video" ? "video/*" : "image/*";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      const eventId = event?.id || event?._id;
      if (!file || !eventId) return;

      const accessToken = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("image", file);
      formData.append("eventId", eventId);

      try {
        const endpoint = type === "lineup"
          ? "events/lineup/upload"
          : type === "video"
          ? "events/teaser/upload"
          : "events/gifs/upload";

        await fetch(`${import.meta.env.VITE_API_URL || 'https://api.event-scanner.com/'}${endpoint}`, {
          method: "POST",
          body: formData,
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        window.location.reload();
      } catch (error) {
        console.error("Upload error:", error);
      }
    };
    fileInput.click();
  };

  const ownerMenuItems = [
    { 
      icon: Megaphone, 
      label: "Sponsor Event", 
      action: () => {
        const eventId = event?.id || event?._id;
        if (eventId) navigate(`/advertising/${eventId}`);
      }
    },
    { 
      icon: Pencil, 
      label: "Edit Event", 
      action: () => {
        const eventId = event?.id || event?._id;
        if (eventId) navigate(`/admin/events/edit/${eventId}`);
      }
    },
    { icon: Users, label: "Add Lineup", action: () => handleFileUpload("lineup") },
    { icon: ImagePlus, label: "Add Pictures", action: () => handleFileUpload("images") },
    { icon: Film, label: "Add Movies", action: () => handleFileUpload("video") },
  ];

  // Redirect zu Slug-URL nur wenn Event geladen wurde UND Slug vorhanden ist
  useEffect(() => {
    if (event && !loading && event.slug) {
      const eventId = event.id || event._id || '';
      if (!eventId) return;
      
      // Generiere die kanonische Slug-URL für das Event
      const canonicalUrl = getEventUrl(event);
      const currentUrl = `/event/${slugAndId}`;
      
      // Nur redirecten wenn:
      // 1. Event hat einen Slug
      // 2. Aktuelle URL ist nicht die kanonische Slug-URL
      // 3. Aktuelle URL ist die alte ID-URL (nicht slug-basiert)
      const isOldIdUrl = currentUrl === `/event/${eventId}`;
      if (canonicalUrl !== currentUrl && isOldIdUrl) {
        navigate(canonicalUrl, { replace: true });
        return;
      }
    }
  }, [event, loading, slugAndId, navigate]);

  useEffect(() => {
    if (event) {
      const eventId = event.id || event._id || '';
      if (eventId) {
        document.title = `${event.title} | EventScanner`;
        if (event?.hostId === user?.id) {
          console.log("event", event?.hostId, user?.id);
          setIsOwner(true);
        }

        // Speichere die Event-ID im Local Storage
        saveEventToHistory(eventId);
      }
    }
  }, [event, user]);

  const handleAddToCalendar = () => {
    if (!event?.startDate) return;

    const formatDate = (date: string) => {
      return date.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    };

    const startDate = new Date(event.startDate);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 5);

    // Format: YYYYMMDDTHHMMSSZ
    const formattedStart = formatDate(startDate.toISOString());
    const formattedEnd = formatDate(endDate.toISOString());

    const eventId = event.id || event._id || '';
    const eventUrl = eventId ? getEventUrl(event) : '';
    const fullUrl = eventUrl ? `https://event-scanner.com${eventUrl}` : '';
    
    const description =
      `${event.title} | \n${fullUrl}\n\n` +
      "\n-----------------------\nDescription\n" +
      event.description +
      " " +
      (event.lineup
        ? "\n-----------------------\nLineup:\n" +
          event.lineup.map((artist) => artist.name).join("\n")
        : "");

    let location = "";
    if (event.address) {
      location =
        event.address.city +
        " " +
        event.address.street +
        " " +
        event.address.houseNumber;
    } else if (event.city) {
      location = event.city;
    }

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${formattedStart}/${formattedEnd}&details=${encodeURIComponent(
      description
    )}&location=${encodeURIComponent(location)}`;

    window.open(googleCalendarUrl, "_blank");
  };

  function handleFavoriteClick(): void {
    const eventId = event?.id || event?._id;
    if (!eventId) return;

    if (isFavorite(eventId)) {
      removeFavorite(eventId);
    } else {
      addFavorite(eventId);
    }
  }

  const handleBack = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const previousPath = document.referrer;
      const isFromOurSite = previousPath.includes(window.location.hostname);

      if (isFromOurSite) {
        navigate(-1);
      } else {
        navigate("/");
      }
    },
    [navigate]
  );

  if (loading) {
    return <EventDetailSkeleton />;
  }

  if (error || !event) {
    return <EventDetailError message={error?.message} />;
  }

  const eventId = event?.id || event?._id || '';
  
  return (
    <div>
      <HelmetMeta event={event} eventId={eventId} />
      <EventStructuredData event={event} eventId={eventId} />
      <div
        className="event-detail"
        style={
          {
            "--event-background-image": `url(${event.imageUrl})`,
          } as React.CSSProperties
        }
      >
        {/* <div className="share-buttons">
          <button
            onClick={handleAddToCalendar}
            className="share-button"
            title="Add to Calendar"
          >
            <CalendarPlus className="h-5 w-5" />
          </button>
          <button
            onClick={() => shareEvent(event)}
            className="share-button"
            title="Share Event"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button
            className={`share-button ${
              isFavorite(eventId || "") ? "active" : ""
            }`}
            onClick={handleFavoriteClick}
            title={
              isFavorite(eventId || "")
                ? "Remove from Favorites"
                : "Add to Favorites"
            }
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite(eventId || "") ? "fill-current" : ""
              }`}
            />
          </button>
          </div> */}

        <EventHero
          imageUrl={event.imageUrl}
          title={event.title}
          onImageClick={() => setShowImageModal(true)}
          />
        <MetaBar {...event} />
        {/* <SponsoredDetail /> */}
        {/* <CommunitySection
          views={event.views ?? 0}
          commentCount={event.commentCount ?? 0}
          city={event.city ?? ""}
          /> */}
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Owner Settings Menu - only for logged in owner */}
        {isOwner && user && (
          <div className="owner-settings-container" ref={ownerMenuRef}>
            <button
              className="owner-settings-btn"
              onClick={() => setShowOwnerMenu(!showOwnerMenu)}
              title="Event Settings"
            >
              {showOwnerMenu ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
            </button>

            {showOwnerMenu && (
              <div className="owner-menu">
                {ownerMenuItems.map((item, index) => (
                  <button
                    key={index}
                    className="owner-menu-item"
                    onClick={() => {
                      item.action();
                      setShowOwnerMenu(false);
                    }}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <item.icon className="owner-menu-icon" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="event-content">
          <div className="event-important-info-contain">
            <div className="event-title-container">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  event.title + " event"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                >
                <h1 className="event-title-detail">{event.title}</h1>
              </a>
            </div>
            <EventBasicInfo
              startDate={event.startDate?.toString() || ""}
              startTime={event.startTime}
              city={event.city}
              description={event.description}
              category={event.category}
              address={event.address}
              handleAddToCalendar={handleAddToCalendar}
              />
            <TicketLinkButton event={event} />
            <EventDescription
              title={event.title}
              description={event.description}
              price={event.price}
              ticketLink={event.ticketLink}
              />
          </div>

          {((event.lineup && event.lineup.length > 0) ||
            (event.lineupPictureUrl && event.lineupPictureUrl.length > 0)) && (
            <EventLineup
              lineup={event.lineup}
              lineupPictureUrls={event.lineupPictureUrl || []}
            />
          )}

          {/* {event.uploadLat && event.uploadLon && (
        <EventLocation
        lat={event.uploadLat}
        lon={event.uploadLon}
        title={event.title}
        />
        )} */}
          {/* <TicketButton href={event.ticketLink || ""} />
          <Social
            instagram={event.socialMediaLinks?.instagram}
            facebook={event.socialMediaLinks?.facebook}
            // tiktok={event.socialMediaLinks?.tiktok}
            // youtube={event.socialMediaLinks?.youtube}
            // soundCloud={event.socialMediaLinks?.soundCloud}
          /> */}
          {event.tags && event.tags.length > 0 && (
            <EventTags tags={event.tags} />
          )}

          {/* {eventId && (
            <div className="event-qr-code-container">
              <QRCodeCanvas
                value={`https://event-scanner.com/event/${eventId}`}
                size={250}
                level="H"
                bgColor="#FFFFFF"
                fgColor="#000000"
                includeMargin={true}
                style={{
                  borderRadius: "12px",
                  padding: "1rem",
                  backgroundColor: "white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              />
            </div>
          )}
           */}
          {host && <EventHost host={host} userId={event.hostId || ""} />}
          {/* {event.startDate && <CalendarButton event={event} />} */}

        </div>
        {isOwner && <HostView eventId={eventId} />}

        <SimilarEvents eventId={eventId} />

        {showImageModal && (
          <ImageModal
            imageUrl={event.imageUrl || ""}
            onClose={() => setShowImageModal(false)}
          />
        )}
        <div className="event-detail-footer">
          <p className="event-detail-text">
            This event was submitted by a user. The content does not originate
            from Event-Scanner or the event organizer. If you are a rights
            holder and wish to request content removal, please review our{" "}
            <span
              onClick={() => navigate("/comment-guidelines")}
              className="underline cursor-pointer"
            >
              Comment Guidelines
            </span>
            .
          </p>

          <p className="event-detail-text">
            Legal notice and contact information{" "}
            <span onClick={() => navigate("/imprint")} className="contact-link">
              here
            </span>
          </p>
        </div>
        <div className="action-bar-container">
          <CommunityBar event={event} />
        </div>
      </div>
        <div>
        <EventGroups event={event} />
        <CommentSection eventId={eventId} />
      </div>
      <Footer />
    </div>
  );
};

// Unterkomponenten in separaten Dateien:
