import { FC, useEffect, useState } from "react";
import EventGalleryIII from "../components/EventGallery/EventGalleryIII";
import { Event } from "../utils";
import "./SearchPage.css";
import { searchNew } from "./service";

export const SearchPage: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const results = await searchNew(searchTerm);
      setEvents(results);
    };

    fetchEvents();
    console.log(events);
    return () => {
      // Cleanup if needed
    };
  }, [searchTerm]);

  return (
    <div className="search-page-container">
      <input
        type="text"
        className="search-page-input"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <EventGalleryIII events={events} title={""}></EventGalleryIII>
    </div>
  );
};
