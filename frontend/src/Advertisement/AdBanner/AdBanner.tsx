import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../../utils";
import "./AdBanner.css";
import { getAdvertisementEvents } from "./service";
export const AdBanner: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getAdvertisementEvents(5);
      setEvents(data);
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === events.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? events.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === events.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  if (events.length === 0) return null;

  return (
    <div className="ad-banner">
      <div className="sponsored-label">Sponsored</div>
      <button className="nav-arrow prev" onClick={handlePrev}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M15 18l-6-6 6-6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        className="ad-banner-content"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {events.map((event) => (
          <a
            key={event.id}
            onClick={() => navigate(`/event/${event._id}`)}
            className="ad-banner-item"
          >
            <img
              src={`https://img.event-scanner.com/insecure/rs:auto/plain/${event.imageUrl}@webp`}
              alt={event.title}
            />
            <div className="ad-banner-overlay">
              <h3>{event.title}</h3>
            </div>
          </a>
        ))}
      </div>

      <button className="nav-arrow next" onClick={handleNext}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M9 18l6-6-6-6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="ad-banner-dots">
        {events.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};
