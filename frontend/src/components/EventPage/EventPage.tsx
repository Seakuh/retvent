import { Heart } from "lucide-react";
import { Event, FeedResponse } from "../../utils";
import { EventGalleryII } from "../EventGallery/EventGalleryII";
import { ExploreFeed } from "../Feed/ExploreFeed";
import "./EventPage.css";

export const EventPage = ({
  favoriteEvents,
  feedItemsResponse,
}: {
  favoriteEvents: Event[];
  feedItemsResponse: FeedResponse[];
}) => {
  return (
    <div>
      <ExploreFeed feedItemsResponse={feedItemsResponse} />
      {favoriteEvents.length === 0 && (
        <div className="no-liked-events">
          <Heart size={100} />
          No liked events for your search. <br></br>Explore and like some events
          :)
        </div>
      )}

      <div className="event-favorites-container">
        <EventGalleryII events={favoriteEvents} title="Liked Events" />
      </div>
    </div>
  );
};
