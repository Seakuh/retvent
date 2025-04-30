import { Heart } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { Event, EventPageParams, FeedResponse } from "../../utils";
import { EventGalleryII } from "../EventGallery/EventGalleryII";
import { ExploreFeed } from "../Feed/ExploreFeed";
import { getLatestFeedByFollowing } from "../Feed/service";
import "./EventPage.css";
import { fetchFavoriteEvents } from "./service";

export const EventPage = ({
  startDate,
  endDate,
  category,
  location,
  prompt,
}: EventPageParams) => {
  const { favoriteEventIds } = useContext(UserContext);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [followedProfiles, setFollowedProfiles] = useState<FeedResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (favoriteEventIds.length > 0) {
          const [favoriteEvents, followedProfiles] = await Promise.all([
            fetchFavoriteEvents(favoriteEventIds, {
              startDate,
              endDate,
              category,
              location,
              prompt,
            }),
            getLatestFeedByFollowing(),
          ]);
          setFavoriteEvents(favoriteEvents);
          setFollowedProfiles(followedProfiles);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [favoriteEventIds, startDate, endDate, category, location, prompt]);

  return (
    <div>
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading...</div>
        </div>
      ) : (
        <>
          <ExploreFeed feedItemsResponse={followedProfiles} />
          {favoriteEvents.length === 0 && (
            <div className="no-liked-events">
              <Heart size={100} />
              No liked events for your search. <br></br>Explore and like some
              events :)
            </div>
          )}

          <div className="event-favorites-container">
            <EventGalleryII events={favoriteEvents} title="Liked Events" />
          </div>
        </>
      )}
    </div>
  );
};
