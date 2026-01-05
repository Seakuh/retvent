import { List, Minus } from "lucide-react";
import { useState } from "react";
import { Event } from "../../utils";
import "./EventSection.css";
import { TrendsListView } from "./TrendsListView";

interface EventSectionProps {
  title?: string;
  events: Event[];
  selectedEvent?: Event | null;
  onEventSelect?: (event: Event) => void;
}

type ViewMode = "list" | "compact";

export const EventSection = ({ title, events }: EventSectionProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  return (
    <>
      {events.length === 0 ? (
        <></>
      ) : (
        <>
          <div className="popular-title-container">
            <h2 className="popular-title">{title}</h2>
            <button
              className="view-toggle-btn"
              onClick={() => setViewMode(viewMode === "list" ? "compact" : "list")}
              title={viewMode === "list" ? "Switch to Compact View" : "Switch to List View"}
            >
              {viewMode === "list" ? (
                <Minus size={20} />
              ) : (
                <List size={20} />
              )}
            </button>
          </div>
          <div className="event-list-container">
            {events.map((event, index) => (
              <div
                className="event-card-list-item"
                key={event.id || event._id}
              >
                <TrendsListView
                  event={event}
                  index={index}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};
