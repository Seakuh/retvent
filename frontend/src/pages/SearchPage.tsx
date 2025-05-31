import { Rabbit } from "lucide-react";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import EventGalleryIII from "../components/EventGallery/EventGalleryIII";
import { Event } from "../utils";
import "./SearchPage.css";
import { searchNew } from "./service";

export const SearchPage: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);

  const fetchEvents = useCallback(
    async (currentOffset: number) => {
      setLoading(true);
      try {
        const results = await searchNew(searchTerm, currentOffset);
        if (results.length === 0) {
          if (currentOffset === 0) setEvents([]);
          setHasMore(false);
        } else {
          setEvents((prev) =>
            currentOffset === 0 ? results : [...prev, ...results]
          );
          setHasMore(true);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
      setLoading(false);
    },
    [searchTerm]
  );

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      offsetRef.current = 0;
      fetchEvents(0);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchEvents]);

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      const newOffset = offsetRef.current + 40;
      offsetRef.current = newOffset;
      fetchEvents(newOffset);
    }
  }, [loading, hasMore, fetchEvents]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="search-page-container">
      <div className="search-page-input-container">
        <input
          type="text"
          className="search-page-input"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {events.length === 0 && !loading ? (
        <div className="no-results">
          <Rabbit size={150} strokeWidth={1.5} />
          <p></p>
        </div>
      ) : (
        <EventGalleryIII events={events} title="" />
      )}

      {loading && <div className="loading-text">Loading...</div>}
    </div>
  );
};
