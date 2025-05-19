import { Heart } from "lucide-react";
import { Event, FeedResponse } from "../../utils";
import { EventGalleryII } from "../EventGallery/EventGalleryII";
import { ExploreFeed } from "../Feed/ExploreFeed";
import "./EventPage.css";
import { EventSection } from "./EventSection";

export const EventPage = ({
  favoriteEvents,
  feedItemsResponse,
}: {
  favoriteEvents: Event[];
  feedItemsResponse: FeedResponse[];
}) => {
  return (
    <div className="event-page-container">
      <ExploreFeed feedItemsResponse={feedItemsResponse} />
      {favoriteEvents.length === 0 && (
        <div className="no-liked-events">
          <Heart size={100} />
          No liked events for your search. <br></br>Explore and like some events
          :)
        </div>
      )}
      <div className="event-page-section-container">
        <EventSection
          events={favoriteEvents.sort(
            (a, b) => (b.views || 0) - (a.views || 0)
          )}
        />
        <div className="event-favorites-container">
          <EventGalleryII events={favoriteEvents} />
        </div>
      </div>
    </div>
  );
};
