import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Calendar, Clock, History, Music, Sparkles, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Event, FeedResponse } from "../../utils";
import { EventPage } from "../EventPage/EventPage";
import Footer from "../../Footer/Footer";
import "./ForYouPage.css";
import { TrendsListView } from "../EventPage/TrendsListView";
import { ExploreFeed } from "../Feed/ExploreFeed";
import Onboarding from "../Onboarding/Onboarding";
import { OnboardingWrapper } from "../Onboarding";
import { loadRecommendedEvents, loadHistoryEvents, RecommendedEvent } from "./service";

const ARTIST_HISTORY_KEY = "recentArtists";

interface ForYouPageProps {
  favoriteEvents: Event[];
  feedItemsResponse: FeedResponse[];
}

export const ForYouPage: React.FC<ForYouPageProps> = ({
  favoriteEvents,
  feedItemsResponse,
}) => {
  const navigate = useNavigate();
  const [historyEvents, setHistoryEvents] = useState<Event[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [recentArtists, setRecentArtists] = useState<string[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [recommendedEvents, setRecommendedEvents] = useState<RecommendedEvent[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isUpcomingExpanded, setIsUpcomingExpanded] = useState(false);
  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingHistory(true);
        setLoadingRecommended(true);

        // Load history events
        const history = await loadHistoryEvents();
        setHistoryEvents(history);

        // Load recommended events (only if onboarding completed)
        const recommended = await loadRecommendedEvents();
        setRecommendedEvents(recommended);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoadingHistory(false);
        setLoadingRecommended(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const loadRecentArtists = () => {
      try {
        const artistsJson = localStorage.getItem(ARTIST_HISTORY_KEY);
        if (artistsJson) {
          const artists: string[] = JSON.parse(artistsJson);
          setRecentArtists(artists);
        }
      } catch (error) {
        console.error("Failed to load recent artists:", error);
        setRecentArtists([]);
      }
    };

    loadRecentArtists();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 120; // Offset für sticky navigation
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const checkScrollButtons = () => {
    if (navContainerRef.current) {
      const container = navContainerRef.current;
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  const scrollNav = (direction: "left" | "right") => {
    if (navContainerRef.current) {
      const scrollAmount = 300;
      const currentScroll = navContainerRef.current.scrollLeft;
      const newScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      navContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };


  const handleArtistClick = (artistName: string) => {
    navigate(`/artist/${encodeURIComponent(artistName)}/events`);
  };

  const handleExportAllToCalendar = () => {
    if (upcomingFavoriteEvents.length === 0) return;

    const formatDate = (date: string) => {
      return date.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    };

    // Erstelle eine ICS-Datei für alle Events
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Event Scanner//EN\nCALSCALE:GREGORIAN\n";

    upcomingFavoriteEvents.forEach((event) => {
      if (!event.startDate) return;

      const startDate = new Date(event.startDate);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 5);

      const formattedStart = formatDate(startDate.toISOString());
      const formattedEnd = formatDate(endDate.toISOString());

      let location = "";
      if (event.address) {
        location = `${event.address.city} ${event.address.street} ${event.address.houseNumber}`;
      } else if (event.city) {
        location = event.city;
      }

      const description = `${event.description || ""}\n\n${event.lineup ? `Lineup: ${event.lineup.map((a) => a.name).join(", ")}` : ""}`;

      icsContent += `BEGIN:VEVENT\n`;
      icsContent += `DTSTART:${formattedStart}\n`;
      icsContent += `DTEND:${formattedEnd}\n`;
      icsContent += `SUMMARY:${event.title}\n`;
      icsContent += `DESCRIPTION:${description.replace(/\n/g, "\\n")}\n`;
      icsContent += `LOCATION:${location}\n`;
      icsContent += `URL:https://event-scanner.com/event/${event.id || event._id}\n`;
      icsContent += `END:VEVENT\n`;
    });

    icsContent += "END:VCALENDAR";

    // Erstelle Blob und Download
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "upcoming-events.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Split favorite events into upcoming and past
  const now = new Date();
  const upcomingFavoriteEvents = favoriteEvents
    .filter((event) => {
      if (!event.startDate) return false;
      const eventDate = new Date(event.startDate);
      return eventDate >= now;
    })
    .sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

  const pastFavoriteEvents = favoriteEvents
    .filter((event) => {
      if (!event.startDate) return false;
      const eventDate = new Date(event.startDate);
      return eventDate < now;
    })
    .sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

  // Split history events into upcoming and past
  const upcomingHistoryEvents = historyEvents
    .filter((event) => {
      if (!event.startDate) return false;
      const eventDate = new Date(event.startDate);
      return eventDate >= now;
    })
    .sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

  const pastHistoryEvents = historyEvents
    .filter((event) => {
      if (!event.startDate) return false;
      const eventDate = new Date(event.startDate);
      return eventDate < now;
    })
    .sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

  // Use recommended events if available, otherwise use favoriteEvents
  const eventsToDisplay = recommendedEvents.length > 0 
    ? recommendedEvents.map(re => re.event)
    : favoriteEvents;

  // Check if recommended events section has no events
  const hasNoRecommendedEvents = eventsToDisplay.length === 0 && !loadingRecommended;

  // Build navigation items - always show all sections, even if empty
  const navigationItems = [
    { id: "foryou-upcoming", label: "Upcoming", icon: Calendar, count: upcomingFavoriteEvents.length, visible: true },
    { id: "foryou-artists", label: "Artists", icon: Music, count: recentArtists.length, visible: true },
    { id: "foryou-history", label: "History", icon: Clock, count: upcomingHistoryEvents.length, visible: true },
    { id: "foryou-past-history", label: "Past", icon: History, count: pastHistoryEvents.length, visible: true },
    { id: "foryou-recommended", label: "Recommended", icon: Sparkles, visible: true },
    { id: "foryou-past-events", label: "Past Events", icon: History, visible: true },
  ];

  // Setup scroll buttons visibility
  useEffect(() => {
    checkScrollButtons();
    if (navContainerRef.current) {
      navContainerRef.current.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        if (navContainerRef.current) {
          navContainerRef.current.removeEventListener("scroll", checkScrollButtons);
        }
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [navigationItems.length]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "foryou-upcoming",
        "foryou-artists",
        "foryou-history",
        "foryou-past-history",
        "foryou-recommended",
        "foryou-past-events",
      ];

      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [upcomingFavoriteEvents, recentArtists, upcomingHistoryEvents, pastHistoryEvents, pastFavoriteEvents]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Reload the page or refresh data
    window.location.reload();
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  // Show Onboarding if button was clicked
  if (showOnboarding) {
    return (
      <OnboardingWrapper
        children={<Onboarding onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />}
      />
    );
  }

  return (
    <div className="foryou-page">
      {/* Horizontal Navigation Bubbles */}
      {navigationItems.length > 0 && (
        <nav className="foryou-nav">
          {showLeftArrow && (
            <button
              className="foryou-nav-scroll-btn foryou-nav-scroll-left"
              onClick={() => scrollNav("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="foryou-nav-container" ref={navContainerRef}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`foryou-nav-item ${activeSection === item.id ? "active" : ""}`}
                  data-section={item.id}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="foryou-nav-badge">{item.count}</span>
                  )}
                </button>
              );
            })}
          </div>
          {showRightArrow && (
            <button
              className="foryou-nav-scroll-btn foryou-nav-scroll-right"
              onClick={() => scrollNav("right")}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </nav>
      )}

      <div className="foryou-content-wrapper">
        {/* {feedItemsResponse && feedItemsResponse.length > 0 && (
          <ExploreFeed feedItemsResponse={feedItemsResponse} />
        )} */}

        {/* Upcoming Favorite Events */}
        {upcomingFavoriteEvents.length > 0 && (
          <div id="foryou-upcoming" className="foryou-section">
            <div className="foryou-section-header">
              <div className="foryou-section-title-wrapper">
                <Calendar className="foryou-section-icon" size={24} />
                <h2 className="foryou-section-title">
                  Your Upcoming
                </h2>
              </div>
              <div className="foryou-section-actions">
                <button
                  className="foryou-expand-button"
                  onClick={() => setIsUpcomingExpanded(!isUpcomingExpanded)}
                  title={isUpcomingExpanded ? "Show less" : "Show all"}
                >
                  {isUpcomingExpanded ? (
                    <>
                      <ChevronUp size={18} />
                      <span>Show less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={18} />
                      <span>Show all ({upcomingFavoriteEvents.length})</span>
                    </>
                  )}
                </button>
                {/* <button
                  className="foryou-calendar-button"
                  onClick={handleExportAllToCalendar}
                  title="Add all upcoming events to calendar"
                >
                  <Download className="foryou-calendar-icon" size={20}/>
                </button> */}
              </div>
            </div>
            <div className="foryou-events-list">
              {(isUpcomingExpanded ? upcomingFavoriteEvents : upcomingFavoriteEvents.slice(0, 3)).map((event, index) => (
                <TrendsListView key={event.id || event._id || index} event={event} index={index} />
              ))}
            </div>
          </div>
        )}


        {/* Recent Artists Section */}
        {recentArtists.length > 0 && (
          <div id="foryou-artists" className="foryou-section">
            <div className="foryou-section-header">
              <div className="foryou-section-title-wrapper">
                <Music className="foryou-section-icon" size={24} />
                <h2 className="foryou-section-title">
                  Artists
                </h2>
                <span className="foryou-section-badge">{recentArtists.length}</span>
              </div>
            </div>
            <div className="foryou-artists-list">
              {recentArtists.map((artistName, index) => (
                <div
                  key={`${artistName}-${index}`}
                  className="foryou-artist-item"
                  onClick={() => handleArtistClick(artistName)}
                >
                  <span className="foryou-artist-name">{artistName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Section */}
        {historyEvents.length > 0 && (
          <>
            {upcomingHistoryEvents.length > 0 && (
              <div id="foryou-history" className="foryou-section">
                <div className="foryou-section-header">
                  <div className="foryou-section-title-wrapper">
                    <Clock className="foryou-section-icon" size={24} />
                    <h2 className="foryou-section-title">
                      History
                    </h2>
                    <span className="foryou-section-badge">{upcomingHistoryEvents.length}</span>
                  </div>
                </div>
                <div className="foryou-events-list">
                  {upcomingHistoryEvents.map((event, index) => (
                    <TrendsListView key={event.id || event._id || index} event={event} index={index} />
                  ))}
                </div>
              </div>
            )}
            {pastHistoryEvents.length > 0 && (
              <div id="foryou-past-history" className="foryou-section">
                <div className="foryou-section-header">
                  <div className="foryou-section-title-wrapper">
                    <History className="foryou-section-icon" size={24} />
                    <h2 className="foryou-section-title">
                      Past
                    </h2>
                    <span className="foryou-section-badge">{pastHistoryEvents.length}</span>
                  </div>
                </div>
                <div className="foryou-events-list">
                  {pastHistoryEvents.map((event, index) => (
                    <TrendsListView key={event.id || event._id || index} event={event} index={index} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {loadingHistory && (
          <div className="foryou-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        <div id="foryou-recommended" className="foryou-section">    
          <div className="foryou-section-header">
            <div className="foryou-section-title-wrapper">
              <Sparkles className="foryou-section-icon" size={24} />
              <h2 className="foryou-section-title">
                Recommended
              </h2>
            </div>
          </div>
          {hasNoRecommendedEvents ? (
            <div className="foryou-empty-state">
              <div className="foryou-empty-content">
                <h2 className="foryou-empty-title">No events yet</h2>
                <p className="foryou-empty-description">
                  Discover personalized events tailored to your taste
                </p>
                <button
                  className="foryou-vibe-check-button"
                  onClick={() => setShowOnboarding(true)}
                >
                  Vibe Check
                </button>
              </div>
            </div>
          ) : (
            <EventPage
              favoriteEvents={eventsToDisplay}
            />
          )}
        </div>

        {!loadingHistory && historyEvents.length === 0 && (
          <div className="foryou-section">
            <div className="foryou-empty">
              <p className="empty-message">
                No recently viewed events. Start exploring events to see them here!
              </p>
            </div>
          </div>
        )}


        {/* Past Favorite Events */}
        {pastFavoriteEvents.length > 0 && (
          <div id="foryou-past-events" className="foryou-section">
            <div className="foryou-section-header">
              <div className="foryou-section-title-wrapper">
                <History className="foryou-section-icon" size={24} />
                <h2 className="foryou-section-title">
                  Past Events
                </h2>
              </div>
            </div>
            <div className="foryou-events-list">
              {pastFavoriteEvents.map((event, index) => (
                <TrendsListView key={event.id || event._id || index} event={event} index={index} />
              ))}
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

