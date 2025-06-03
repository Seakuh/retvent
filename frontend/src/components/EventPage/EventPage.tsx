import { Heart } from "lucide-react";
import { AdBanner } from "../../Advertisement/AdBanner/AdBanner";
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
      <AdBanner />
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
          title="🔥 Trends"
          events={favoriteEvents.sort(
            (a, b) => (b.views || 0) - (a.views || 0)
          )}
        />
        <div className="event-page-trends-container">
          {/* Group events by their highest engagement tag */}
          {Object.entries(
            favoriteEvents.reduce((acc, event) => {
              const tags = event.tags?.map((tag) => tag.toLowerCase()) || [];
              // Calculate engagement score for this event
              const eventScore = (event.views || 0) + (event.commentCount || 0);

              // Find the tag with highest total engagement score
              let bestTag = tags[0];
              let maxScore = 0;

              tags.forEach((tag) => {
                if (!acc[tag]) acc[tag] = [];
                const tagScore = acc[tag].reduce(
                  (sum, e) => sum + ((e.views || 0) + (e.commentCount || 0)),
                  0
                );
                if (tagScore > maxScore) {
                  maxScore = tagScore;
                  bestTag = tag;
                }
              });

              // Only add event to its best matching tag
              if (bestTag && !acc[bestTag]?.find((e) => e.id === event.id)) {
                if (!acc[bestTag]) acc[bestTag] = [];
                acc[bestTag].push(event);
              }
              return acc;
            }, {} as Record<string, Event[]>)
          ).map(([tag, events]) => {
            // Sort by engagement score (views + comments)
            const sortedEvents = events.sort((a, b) => {
              const scoreA = (a.views || 0) + (a.commentCount || 0);
              const scoreB = (b.views || 0) + (b.commentCount || 0);
              return scoreB - scoreA;
            });

            // Only show tags with at least 4 events
            if (events.length >= 4) {
              return (
                <div key={tag} className="event-page-section-container">
                  <EventSection title={`#${tag}`} events={sortedEvents} />
                </div>
              );
            }
            return null;
          })}
        </div>
        <div className="event-favorites-container">
          <EventGalleryII events={favoriteEvents} />
        </div>
      </div>
    </div>
  );
};
