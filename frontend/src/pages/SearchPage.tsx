import { FC, useCallback, useEffect, useState } from "react";
import EventGalleryIII from "../components/EventGallery/EventGalleryIII";
import { Event } from "../utils";
import "./SearchPage.css";
import { searchNew } from "./service";

export const SearchPage: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchEvents = useCallback(
    async (currentOffset: number) => {
      setLoading(true);
      try {
        const results = await searchNew(searchTerm, currentOffset);
        if (results.length === 0) {
          setHasMore(false);
        } else {
          setEvents((prev) =>
            currentOffset === 0 ? results : [...prev, ...results]
          );
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
      setOffset(0);
      fetchEvents(0);
    }, 600);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchEvents]);

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollHeight - scrollTop - clientHeight < 100) {
      const newOffset = offset + 40;
      setOffset(newOffset);
      fetchEvents(newOffset);
    }
  }, [loading, hasMore, offset, fetchEvents]);

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
      <EventGalleryIII events={events} title={""}></EventGalleryIII>
      {loading && <div>Lädt...</div>}
    </div>
  );
};
