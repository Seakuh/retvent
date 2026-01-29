import { Rabbit } from "lucide-react";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventGalleryIII from "../components/EventGallery/EventGalleryIII";
import { defaultProfileImage, Event, Profile } from "../utils";
import "./SearchPage.css";
import { searchArtists, searchNew, searchProfiles } from "./service";
export const SearchPage: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [topTags, setTopTags] = useState<[string, number][]>([]);
  const offsetRef = useRef(0);
  const navigate = useNavigate();
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

          const tagCounts = results.reduce((acc, event) => {
            event.tags?.forEach((tag) => {
              const normalizedTag = tag
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9äöüß]/g, "");

              if (normalizedTag) {
                acc[normalizedTag] = (acc[normalizedTag] || 0) + 1;
              }
            });
            return acc;
          }, {} as Record<string, number>);

          const sortedTags = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

          setTopTags(sortedTags);
          console.log("Top 5 Tags:", sortedTags);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
      setLoading(false);
    },
    [searchTerm]
  );

  const fetchProfiles = useCallback(async () => {
    const results = await searchProfiles(searchTerm);
    setProfiles(results);
    console.log("Profiles", results);
  }, [searchTerm]);

  const fetchArtists = useCallback(async () => {
    const results = await searchArtists(searchTerm);
    setArtists(results);
    console.log("Artists", results);
  }, [searchTerm]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      offsetRef.current = 0;
      fetchEvents(0);
      fetchProfiles();
      fetchArtists();
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
        {/* <div className="trend-component">
          {topTags.length > 0 && (
            <div className="top-tags">
              {topTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="search-page-tag"
                  onClick={() => {
                    setSearchTerm(tag);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{ cursor: "pointer" }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div> */}
      </div>
      {/* Profiles Section */}
      {profiles.length > 0 && (
        <div className="search-page-section">
          <h2 className="search-page-section-title">Profiles</h2>
          <div className="search-page-profiles-container">
            {profiles.map((profile) => (
              <div key={profile.id}>
                <div
                  className="search-profile-card-inner"
                  onClick={() => {
                    navigate(`/profile/${profile.userId}`);
                  }}
                >
                  <img
                    className="search-profile-card-image"
                    src={
                      profile.profileImageUrl
                        ? `https://img.event-scanner.com/insecure/rs:fill:96:96/plain/${profile.profileImageUrl}@webp`
                        : defaultProfileImage
                    }
                    loading="lazy"
                  />
                </div>
                <div className="profile-card-username-container">
                  <h3 className="profile-card-username">
                    {profile.username || "Profile"}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artists Section */}
      {artists.length > 0 && (
        <div className="search-page-section">
          <h2 className="search-page-section-title">Artists</h2>
          <div className="search-page-artists-container">
            {artists.map((artist, index) => {
              // Handle both string and object types
              const artistName = typeof artist === 'string' ? artist : (artist as any)?.name || String(artist);
              return (
                <div 
                  key={`${artistName}-${index}`} 
                  className="search-page-artist-card"
                  onClick={() => navigate(`/artist/${encodeURIComponent(artistName)}/events`)}
                >
                  <img src={defaultProfileImage} alt={artistName} />
                  <h3>{artistName}</h3>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Events Section */}
      {events.length === 0 && !loading ? (
        <div className="no-results">
          <Rabbit size={150} strokeWidth={1.5} />
          <p></p>
        </div>
      ) : (
        <div className="search-page-section">
          <h2 className="search-page-section-title">Events</h2>
          <EventGalleryIII events={events} title="" />
        </div>
      )}

      {loading && <div className="loading-text">Loading...</div>}
    </div>
  );
};
