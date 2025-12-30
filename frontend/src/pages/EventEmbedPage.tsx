import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Event, getImageProxyUrl } from "../utils";
import "./EventEmbedPage.css";
import { ClockIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const EventEmbedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Host Id
  const hostId = searchParams.get("hostId");

  // Parse query parameters
  const limit = parseInt(searchParams.get("limit") || "999");

  // Support both mainColor and primaryColor (primaryColor takes precedence)
  const mainColorParam = searchParams.get("primaryColor") || searchParams.get("mainColor") || "0D0E23";
  const secondaryColorParam = searchParams.get("secondaryColor") || "000000";

  // Ensure colors have # prefix
  const mainColor = mainColorParam.startsWith("#") ? mainColorParam : `#${mainColorParam}`;
  const secondaryColor = secondaryColorParam.startsWith("#") ? secondaryColorParam : `#${secondaryColorParam}`;

  // Event filter parameters
  const titleFilter = searchParams.get("title");
  const descriptionFilter = searchParams.get("description");
  const imageUrlFilter = searchParams.get("imageUrl");
  const startDateFilter = searchParams.get("startDate");
  const startTimeFilter = searchParams.get("startTime");
  const endDateFilter = searchParams.get("endDate");
  const endTimeFilter = searchParams.get("endTime");
  const organizerIdFilter = searchParams.get("organizerId");
  const locationIdFilter = searchParams.get("locationId");
  const artistIdsFilter = searchParams.get("artistIds")?.split(",");
  const tagsFilter = searchParams.get("tags")?.split(",");

  useEffect(() => {
    // Set CSS variables for custom colors
    document.documentElement.style.setProperty("--embed-main-color", mainColor);
    document.documentElement.style.setProperty("--embed-secondary-color", secondaryColor);

    // Set background to mainColor
    document.body.style.setProperty("background", mainColor, "important");
    document.body.style.setProperty("background-color", mainColor, "important");
    document.body.style.setProperty("background-image", "none", "important");
    document.documentElement.style.setProperty("background", mainColor, "important");
    document.documentElement.style.setProperty("background-color", mainColor, "important");
    document.documentElement.style.setProperty("background-image", "none", "important");

    const root = document.getElementById("root");
    if (root) {
      root.style.setProperty("background", mainColor, "important");
      root.style.setProperty("background-color", mainColor, "important");
    }
  }, [mainColor, secondaryColor]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Use different endpoint based on whether hostId is provided
        const apiUrl = hostId
          ? `${API_URL}events/host/id/${hostId}`
          : `${API_URL}events/latest`;

        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(data);
        let fetchedEvents: Event[] = data.events || data || [];

        // Filter events based on query parameters
        if (titleFilter) {
          fetchedEvents = fetchedEvents.filter((event) =>
            event.title?.toLowerCase().includes(titleFilter.toLowerCase())
          );
        }

        if (descriptionFilter) {
          fetchedEvents = fetchedEvents.filter((event) =>
            event.description?.toLowerCase().includes(descriptionFilter.toLowerCase())
          );
        }

        if (imageUrlFilter) {
          fetchedEvents = fetchedEvents.filter((event) => event.imageUrl === imageUrlFilter);
        }

        if (startDateFilter) {
          fetchedEvents = fetchedEvents.filter((event) => {
            if (!event.startDate) return false;
            const eventDate = new Date(event.startDate).toISOString().split("T")[0];
            return eventDate === startDateFilter;
          });
        }

        if (startTimeFilter) {
          fetchedEvents = fetchedEvents.filter((event) => event.startTime === startTimeFilter);
        }

        if (endDateFilter) {
          fetchedEvents = fetchedEvents.filter((event) => {
            if (!event.endDate) return false;
            const eventDate = new Date(event.endDate).toISOString().split("T")[0];
            return eventDate === endDateFilter;
          });
        }

        if (endTimeFilter) {
          fetchedEvents = fetchedEvents.filter((event) => event.endTime === endTimeFilter);
        }

        if (organizerIdFilter) {
          fetchedEvents = fetchedEvents.filter((event) => event.hostId === organizerIdFilter);
        }

        if (locationIdFilter) {
          fetchedEvents = fetchedEvents.filter((event) => event.locationId === locationIdFilter);
        }

        if (artistIdsFilter && artistIdsFilter.length > 0) {
          fetchedEvents = fetchedEvents.filter((event) =>
            event.lineup?.some((artist) => artistIdsFilter.includes(artist.name))
          );
        }

        if (tagsFilter && tagsFilter.length > 0) {
          fetchedEvents = fetchedEvents.filter((event) =>
            event.tags?.some((tag) => tagsFilter.includes(tag))
          );
        }

        // Don't limit here - limit will be applied after date filtering
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events for embed:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchEvents();
  }, [
    hostId,
    limit,
    titleFilter,
    descriptionFilter,
    imageUrlFilter,
    startDateFilter,
    startTimeFilter,
    endDateFilter,
    endTimeFilter,
    organizerIdFilter,
    locationIdFilter,
    artistIdsFilter,
    tagsFilter,
  ]);

  // Horizontal scroll with mouse wheel (desktop only)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || events.length === 0) return;

    const handleWheel = (e: WheelEvent) => {
      // Skip on mobile devices
      if ("ontouchstart" in window) return;

      // Check if container is scrollable
      if (container.scrollWidth <= container.clientWidth) return;

      // Check if mouse is over container
      const rect = container.getBoundingClientRect();
      const isOverContainer =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!isOverContainer) return;

      // Check if vertical scrolling
      if (e.deltaY === 0) return;

      // Prevent default scroll behavior
      e.preventDefault();

      // Scroll horizontally
      container.scrollLeft += e.deltaY;
    };

    // Event listener only on desktop
    if (!("ontouchstart" in window)) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (!("ontouchstart" in window)) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [events]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleEventClick = (eventId: string) => {
    // Open event in new tab on main site
    const mainSiteUrl = "https://event-scanner.com";
    window.open(`${mainSiteUrl}event/${eventId}`, "_blank");
  };

  // Filter and sort events by upcoming/past
  const getFilteredEvents = () => {
    const now = new Date();

    const filteredEvents = events.filter((event) => {
      const eventDate = new Date(event.startDate || new Date());
      return showHistory ? eventDate < now : eventDate >= now;
    });

    // Sort: upcoming ascending, past descending
    const sortedEvents = filteredEvents.sort((a, b) => {
      const dateA = new Date(a.startDate || new Date()).getTime();
      const dateB = new Date(b.startDate || new Date()).getTime();
      return showHistory ? dateB - dateA : dateA - dateB;
    });

    // Apply limit AFTER filtering and sorting
    return sortedEvents.slice(0, limit);
  };

  const displayedEvents = getFilteredEvents();

  if (loading) {
    return (
      <div className="embed-loading">
        <div className="embed-spinner"></div>
      </div>
    );
  }

  return (
    <div
      className={`event-embed-container`}
    >
      <div className="event-embed-header">
        <h1>{showHistory ? "PAST EVENTS" : "NEXT EVENTS"}</h1>
        <button
          className="history-button"
          onClick={() => setShowHistory(!showHistory)}
          aria-label={showHistory ? "Show upcoming events" : "Show past events"}
        >
          <ClockIcon />
        </button>
      </div>
      {displayedEvents.length === 0 ? (
        <div className="embed-no-events">
          <p>No {showHistory ? "past" : "upcoming"} events found.</p>
        </div>
      ) : (
        <div ref={scrollContainerRef} className="event-embed-scroll">
          <div className="event-embed-grid">
            {displayedEvents.map((event) => (
            <a
              key={event.id || event._id}
              className="event-embed-card"
              onClick={() => handleEventClick(event.id || event._id || "")}
              style={{ cursor: "pointer", backgroundColor: secondaryColor }}
            >
              <div className="event-embed-card-image">
                <img
                  src={getImageProxyUrl(event.imageUrl, 400, 247)}
                  alt={event.title}
                  loading="lazy"
                />
              </div>
              <div className="event-embed-card-content">
                <h3 className="event-embed-card-title">{event.title}</h3>
                <div className="event-embed-card-date">
                  {formatDate(event.startDate || new Date())}
                  {event.startTime && ` • ${event.startTime}`}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

export default EventEmbedPage;
