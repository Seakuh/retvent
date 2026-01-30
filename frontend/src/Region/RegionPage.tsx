import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RealListItem } from "../components/EventGallery/Items/RealListItem";
import { API_URL, Event, IRegion } from "../utils";
import "./RegionPage.css";
import { getRegion, getRegionEvents, uploadRegionLogo, uploadRegionImages, getSimilarRegions } from "./service";
import { ChevronLeft, Plus, Navigation, X, Info, Edit, MapPin, Calendar, ChevronRight } from "lucide-react";
import { RegionSearchModal } from "./RegionSearchModal";
import Footer from "../Footer/Footer";

export const RegionPage = () => {
  const { regionSlug } = useParams();
  const [region, setRegion] = useState<IRegion | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showVibeModal, setShowVibeModal] = useState(false);
  const [showRegionSearchModal, setShowRegionSearchModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAllBubbles, setShowAllBubbles] = useState(false);
  const [showAllArtists, setShowAllArtists] = useState(false);
  const [bubblesToShow, setBubblesToShow] = useState(4);
  const [isMobile, setIsMobile] = useState(false);
  const [similarRegions, setSimilarRegions] = useState<IRegion[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const regionSearchInputRef = useRef<HTMLInputElement>(null);
  const eventsContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fetchRegion = async () => {
      if (!regionSlug) return;
      setIsLoading(true);
      try {
        const fetchedRegion = await getRegion(regionSlug);
        if (fetchedRegion) {
          setRegion(fetchedRegion);
          setNotFound(false);
          
          // Events für die Region laden
          if (fetchedRegion.id) {
            const regionEvents = await getRegionEvents(fetchedRegion.id);
            setEvents(regionEvents);
            
            // Ähnliche Regionen laden
            const similar = await getSimilarRegions(fetchedRegion.id, 6);
            // Aktuelle Region aus den ähnlichen Regionen entfernen
            setSimilarRegions(similar.filter(r => r.id !== fetchedRegion.id));
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching region:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegion();
  }, [regionSlug]);

  // Scroll-Listener für Glassmorphism-Effekt
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate header height for sticky navigation
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
        // Set CSS variable on document root
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };

    // Initial calculation
    updateHeaderHeight();
    
    // Update on resize
    window.addEventListener("resize", updateHeaderHeight);
    
    // Update when region changes (header content might change)
    const timeoutId = setTimeout(updateHeaderHeight, 100);
    
    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
      clearTimeout(timeoutId);
    };
  }, [region]);

  // Anzahl der Bubbles basierend auf Bildschirmgröße
  useEffect(() => {
    const updateBubblesToShow = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setBubblesToShow(mobile ? 4 : 5);
    };

    updateBubblesToShow();
    window.addEventListener("resize", updateBubblesToShow);
    return () => window.removeEventListener("resize", updateBubblesToShow);
  }, []);

  // Scroll zu Event mit bestimmten Tag/Category
  const handleBubbleClick = (bubble: string) => {
    const offset = 150; // Offset für sticky header
    
    // Finde das erste Event mit diesem Tag oder Category
    const matchingEvent = events.find((event) => {
      const tagMatch = event.tags?.some(
        (tag) => tag.toLowerCase() === bubble.toLowerCase()
      );
      const categoryMatch =
        event.category?.toLowerCase() === bubble.toLowerCase();
      return tagMatch || categoryMatch;
    });

    if (matchingEvent && eventsContainerRef.current) {
      const eventId = matchingEvent.id || matchingEvent._id;
      const eventElement = document.querySelector(
        `[data-event-id="${eventId}"]`
      ) as HTMLElement;

      if (eventElement) {
        const elementPosition = eventElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      } else {
        // Falls Element noch nicht gerendert, zum Events-Container scrollen
        if (eventsContainerRef.current) {
          const containerPosition =
            eventsContainerRef.current.getBoundingClientRect().top;
          const offsetPosition =
            containerPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    } else if (eventsContainerRef.current) {
      // Falls kein Event gefunden, zum Events-Container scrollen
      const containerPosition =
        eventsContainerRef.current.getBoundingClientRect().top;
      const offsetPosition = containerPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!region?.id) return;
    
    // Prüfe ob Benutzer eingeloggt ist
    const token = localStorage.getItem("access_token");
    if (!token) {
      const shouldLogin = confirm("Bitte melde dich an, um Bilder hochzuladen. Zur Login-Seite weiterleiten?");
      if (shouldLogin) {
        navigate("/login");
      }
      return;
    }

    setIsUploadingLogo(true);
    try {
      const updatedRegion = await uploadRegionLogo(region.id, file);
      if (updatedRegion) {
        setRegion(updatedRegion);
      }
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      if (error.message?.includes("401") || error.message?.includes("anmelden")) {
        const shouldLogin = confirm("Bitte melde dich an, um Bilder hochzuladen. Zur Login-Seite weiterleiten?");
        if (shouldLogin) {
          navigate("/login");
        }
      } else {
        alert(error.message || "Fehler beim Hochladen des Logos.");
      }
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleImagesUpload = async (files: File[]) => {
    if (!region?.id || files.length === 0) return;
    
    // Prüfe ob Benutzer eingeloggt ist
    const token = localStorage.getItem("access_token");
    if (!token) {
      const shouldLogin = confirm("Bitte melde dich an, um Bilder hochzuladen. Zur Login-Seite weiterleiten?");
      if (shouldLogin) {
        navigate("/login");
      }
      return;
    }

    setIsUploadingImages(true);
    try {
      const updatedRegion = await uploadRegionImages(region.id, files);
      if (updatedRegion) {
        setRegion(updatedRegion);
      }
    } catch (error: any) {
      console.error("Error uploading images:", error);
      if (error.message?.includes("401") || error.message?.includes("anmelden")) {
        const shouldLogin = confirm("Bitte melde dich an, um Bilder hochzuladen. Zur Login-Seite weiterleiten?");
        if (shouldLogin) {
          navigate("/login");
        }
      } else {
        alert(error.message || "Fehler beim Hochladen der Bilder.");
      }
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleImagesUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length > 0) {
      handleImagesUpload(imageFiles);
    }
  };

  const handleGoogleMapsNavigation = () => {
    if (region?.coordinates) {
      const { latitude, longitude } = region.coordinates;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(url, "_blank");
    }
  };

  const handleSetUserLocation = async () => {
    if (!region?.id) return;

    if (!navigator.geolocation) {
      alert("Geolocation wird von Ihrem Browser nicht unterstützt.");
      return;
    }

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Update region coordinates
          const token = localStorage.getItem("access_token");
          const headers: HeadersInit = {
            "Content-Type": "application/json",
          };
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }

          try {
            const response = await fetch(`${API_URL}regions/${region.id}`, {
              method: "PATCH",
              headers: headers,
              body: JSON.stringify({
                coordinates: {
                  latitude,
                  longitude,
                },
              }),
            });

            if (response.ok) {
              const updatedRegion = await response.json();
              setRegion(updatedRegion);
            } else {
              throw new Error("Failed to update region");
            }
          } catch (error) {
            console.error("Error updating region coordinates:", error);
            alert("Fehler beim Aktualisieren der Koordinaten.");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          if (error.code === error.PERMISSION_DENIED) {
            alert("Standortzugriff wurde verweigert. Bitte erlauben Sie den Zugriff in Ihren Browsereinstellungen.");
          } else {
            alert("Fehler beim Abrufen Ihres Standorts.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch (error) {
      console.error("Error requesting location:", error);
      alert("Fehler beim Anfordern des Standorts.");
    }
  };

  // Sammle alle Tags und Categories aus den Events
  const getAllTagsAndCategories = () => {
    const tagsSet = new Set<string>();
    const categoriesSet = new Set<string>();

    events.forEach((event) => {
      if (event.tags && Array.isArray(event.tags)) {
        event.tags.forEach((tag) => {
          if (tag && tag.trim()) {
            tagsSet.add(tag.trim());
          }
        });
      }
      if (event.category && event.category.trim()) {
        categoriesSet.add(event.category.trim());
      }
    });

    return {
      tags: Array.from(tagsSet),
      categories: Array.from(categoriesSet),
    };
  };

  // Sammle alle Artists aus den Events
  const getAllArtists = () => {
    const artistsSet = new Set<string>();

    events.forEach((event) => {
      if (event.lineup && Array.isArray(event.lineup)) {
        event.lineup.forEach((artist) => {
          if (artist.name && artist.name.trim()) {
            artistsSet.add(artist.name.trim());
          }
        });
      }
    });

    return Array.from(artistsSet);
  };

  const { tags, categories } = getAllTagsAndCategories();
  const allBubbles = [...categories, ...tags];
  const allArtists = getAllArtists();

  // Group and sort events by date
  const { dateOptions, eventsByDate, upcomingEvents, pastEvents } = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Separate upcoming and past events
    const upcoming: Event[] = [];
    const past: Event[] = [];

    events.forEach((event) => {
      if (!event.startDate) return;
      const eventDate = new Date(event.startDate);
      eventDate.setHours(0, 0, 0, 0);
      if (eventDate >= today) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    // Sort upcoming ascending, past descending
    upcoming.sort((a, b) => {
      const dateA = new Date(a.startDate!).getTime();
      const dateB = new Date(b.startDate!).getTime();
      return dateA - dateB;
    });

    past.sort((a, b) => {
      const dateA = new Date(a.startDate!).getTime();
      const dateB = new Date(b.startDate!).getTime();
      return dateB - dateA;
    });

    // Group events by date
    const grouped = new Map<string, Event[]>();
    [...upcoming, ...past].forEach((event) => {
      if (!event.startDate) return;
      const eventDate = new Date(event.startDate);
      eventDate.setHours(0, 0, 0, 0);
      const dateKey = eventDate.toISOString().split("T")[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });

    // Create date options
    const uniqueDates = Array.from(grouped.keys()).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    const dateOptions = uniqueDates.map((dateKey) => {
      const date = new Date(dateKey);
      const id = `region-date-${dateKey}`;
      let label: string;

      if (date.getTime() === today.getTime()) {
        label = "Heute";
      } else if (date.getTime() === tomorrow.getTime()) {
        label = "Morgen";
      } else {
        label = date.toLocaleDateString("de-DE", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
      }

      return { date, id, label, dateKey };
    });

    return {
      dateOptions,
      eventsByDate: grouped,
      upcomingEvents: upcoming,
      pastEvents: past,
    };
  })();

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = dateOptions.map((opt) => opt.id);
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
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dateOptions]);

  // Auto-scroll navigation to active section
  useEffect(() => {
    if (!activeSection || !navContainerRef.current) return;

    const activeButton = navContainerRef.current.querySelector(
      `[data-section="${activeSection}"]`
    ) as HTMLElement;

    if (activeButton) {
      const container = navContainerRef.current;
      const buttonLeft = activeButton.offsetLeft;
      const buttonWidth = activeButton.offsetWidth;
      const containerWidth = container.clientWidth;
      const scrollLeft = container.scrollLeft;

      const buttonRight = buttonLeft + buttonWidth;
      const visibleLeft = scrollLeft;
      const visibleRight = scrollLeft + containerWidth;

      if (buttonLeft < visibleLeft) {
        container.scrollTo({
          left: buttonLeft - 20,
          behavior: "smooth",
        });
      } else if (buttonRight > visibleRight) {
        container.scrollTo({
          left: buttonRight - containerWidth + 20,
          behavior: "smooth",
        });
      }
    }
  }, [activeSection]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 150;
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
  }, [dateOptions.length]);

  const handleDateSelect = (date: Date, sectionId: string) => {
    setSelectedDate(date);
    scrollToSection(sectionId);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (notFound || !region) {
    return (
      <div className="region-page-container">
        <div className="region-page-not-found">
          <h1>Region nicht gefunden</h1>
          <p>Die angeforderte Region konnte nicht gefunden werden.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="region-page-container">
      <div className={`region-page-header ${isScrolled ? "scrolled" : ""}`} ref={headerRef}>
        <button onClick={() => navigate("/")} className="back-button">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="region-page-header-content">
          <div className="region-page-logo-container" onClick={handleLogoClick}>
            {region.logoUrl ? (
              <img src={region.logoUrl} alt={region.name} />
            ) : (
              <div className="region-page-logo-placeholder">
                <Plus size={24} />
              </div>
            )}
            {isUploadingLogo && (
              <div className="region-page-upload-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ display: "none" }}
            />
          </div>
          <div className="region-page-header-right">
            <div className="region-page-title-container">
              <div className="region-page-title-row">
                <div className="region-page-title-with-edit">
                  <h1 className="region-page-title">{region.h1 || region.name}</h1>
                  <button
                    className="region-page-edit-icon-inline"
                    onClick={() => setShowRegionSearchModal(true)}
                    aria-label="Change region"
                  >
                    <Edit size={18} />
                  </button>
                  {/* <button
                    className="region-page-location-icon-inline"
                    onClick={handleSetUserLocation}
                    aria-label="Set to my location"
                  >
                    <MapPin size={18} />
                  </button> */}
                </div>
                <div className="region-page-header-icons">
                  {(region.description || region.introText || region.vibe) && (
                    <button
                      className="region-page-info-icon"
                      onClick={() => {
                        if (region.vibe) {
                          setShowVibeModal(true);
                        } else {
                          setShowDescriptionModal(true);
                        }
                      }}
                      aria-label="Show info"
                    >
                      <Info size={20} />
                    </button>
                  )}
                  {region.coordinates && (
                    <button
                      className="region-page-navigation-icon"
                      onClick={handleGoogleMapsNavigation}
                      aria-label="Directions"
                    >
                      <Navigation size={20} />
                    </button>
                  )}
                </div>
              </div>
              <div className="region-page-actions">
                {/* <button
                  className="region-google-search-button pill-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const searchQuery = `${region.name} event`;
                    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
                    window.open(url, "_blank");
                  }}
                  aria-label="Suche auf Google"
                >
                  <img
                    src="/google.png"
                    alt="Google"
                    className="region-google-search-icon"
                  />
                  <span className="region-google-search-text">GOOGLE</span>
                </button> */}
              </div>
              {/*  */}
            </div>
          </div>
        </div>
      </div>
      {allArtists.length > 0 && (
        <div className={`region-page-artists-section ${showAllArtists ? "show-all" : ""}`}>
          <h3 className="region-page-artists-title">Upcoming Artists</h3>
          <div className="region-page-artists-container">
            {(isMobile ? allArtists : (showAllArtists ? allArtists : allArtists.slice(0, bubblesToShow))).map((artist, index) => (
              <span
                key={index}
                className="region-page-artist-bubble"
                onClick={() => navigate(`/artist/${encodeURIComponent(artist)}/events`)}
              >
                {artist}
              </span>
            ))}
          </div>
          {!isMobile && allArtists.length > bubblesToShow && (
            <button
              className="region-page-show-more-button"
              onClick={() => setShowAllArtists(!showAllArtists)}
            >
              {showAllArtists ? "Less" : "More..."}
            </button>
          )}
        </div>
      )}



      {allBubbles.length > 0 && (
        <div className={`region-page-bubbles-section ${showAllBubbles ? "show-all" : ""}`}>
          <h3 className="region-page-bubbles-title">Upcoming Vibe</h3>
          <div className="region-page-bubbles-container">
            {(isMobile ? allBubbles : (showAllBubbles ? allBubbles : allBubbles.slice(0, bubblesToShow))).map((bubble, index) => (
              <span
                key={index}
                className="region-page-bubble"
                onClick={() => handleBubbleClick(bubble)}
              >
                {bubble}
              </span>
            ))}
          </div>
          {!isMobile && allBubbles.length > bubblesToShow && (
            <button
              className="region-page-show-more-button"
              onClick={() => setShowAllBubbles(!showAllBubbles)}
            >
              {showAllBubbles ? "Less" : "More..."}
            </button>
          )}
        </div>
      )}



      {showDescriptionModal && (
        <div className="region-page-description-modal-overlay" onClick={() => setShowDescriptionModal(false)}>
          <div className="region-page-description-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="region-page-description-modal-close"
              onClick={() => setShowDescriptionModal(false)}
            >
              <X size={24} />
            </button>
            <h2>{region.h1 || region.name}</h2>
            {region.introText && (
              <div className="region-page-description-modal-section">
                <p>{region.introText}</p>
              </div>
            )}
            {region.description && (
              <div className="region-page-description-modal-section">
                <p>{region.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showVibeModal && region.vibe && (
        <div className="region-page-description-modal-overlay" onClick={() => setShowVibeModal(false)}>
          <div className="region-page-description-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="region-page-description-modal-close"
              onClick={() => setShowVibeModal(false)}
            >
              <X size={24} />
            </button>
            <h2>Vibe - {region.h1 || region.name}</h2>
            {region.introText && (
              <div className="region-page-description-modal-section">
                <p>{region.introText}</p>
              </div>
            )}
            {region.description && (
              <div className="region-page-description-modal-section">
                <p>{region.description}</p>
              </div>
            )}
            <div className="region-page-vibe-container">
              <div className="region-page-vibe-details">
                {region.vibe.energy !== undefined && (
                  <div className="region-page-vibe-item">
                    <div className="region-page-vibe-label">
                      <span>⚡ Energy</span>
                      <span className="region-page-vibe-value">{region.vibe.energy}%</span>
                    </div>
                    <div className="region-page-vibe-progress-bar">
                      <div 
                        className="region-page-vibe-progress-fill" 
                        style={{ width: `${region.vibe.energy}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {region.vibe.intimacy !== undefined && (
                  <div className="region-page-vibe-item">
                    <div className="region-page-vibe-label">
                      <span>💫 Intimacy</span>
                      <span className="region-page-vibe-value">{region.vibe.intimacy}%</span>
                    </div>
                    <div className="region-page-vibe-progress-bar">
                      <div 
                        className="region-page-vibe-progress-fill" 
                        style={{ width: `${region.vibe.intimacy}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {region.vibe.exclusivity !== undefined && (
                  <div className="region-page-vibe-item">
                    <div className="region-page-vibe-label">
                      <span>✨ Exclusivity</span>
                      <span className="region-page-vibe-value">{region.vibe.exclusivity}%</span>
                    </div>
                    <div className="region-page-vibe-progress-bar">
                      <div 
                        className="region-page-vibe-progress-fill" 
                        style={{ width: `${region.vibe.exclusivity}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {region.vibe.social !== undefined && (
                  <div className="region-page-vibe-item">
                    <div className="region-page-vibe-label">
                      <span>👥 Social</span>
                      <span className="region-page-vibe-value">{region.vibe.social}%</span>
                    </div>
                    <div className="region-page-vibe-progress-bar">
                      <div 
                        className="region-page-vibe-progress-fill" 
                        style={{ width: `${region.vibe.social}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showRegionSearchModal && (
        <RegionSearchModal
          isOpen={showRegionSearchModal}
          onClose={() => setShowRegionSearchModal(false)}
          onSelectRegion={(regionSlug) => {
            navigate(`/region/${regionSlug}`);
            setShowRegionSearchModal(false);
          }}
          inputRef={regionSearchInputRef}
        />
      )}

      {/* Date Navigation Bubbles */}
      {dateOptions.length > 0 && (
        <nav 
          className="region-date-nav"
          style={{ top: `${headerHeight}px` } as React.CSSProperties}
        >
          {showLeftArrow && (
            <button
              className="region-date-nav-scroll-btn region-date-nav-scroll-left"
              onClick={() => scrollNav("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="region-date-nav-container" ref={navContainerRef}>
            {dateOptions.map((option) => {
              const isSelected =
                selectedDate && selectedDate.toDateString() === option.date.toDateString();
              return (
                <button
                  key={option.id}
                  onClick={() => handleDateSelect(option.date, option.id)}
                  className={`region-date-nav-item ${isSelected ? "active" : ""} ${
                    activeSection === option.id ? "active-scroll" : ""
                  }`}
                  data-section={option.id}
                >
                  <Calendar size={18} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
          {showRightArrow && (
            <button
              className="region-date-nav-scroll-btn region-date-nav-scroll-right"
              onClick={() => scrollNav("right")}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </nav>
      )}

      <div className="region-page-events-section">
        <h3 className="region-page-events-title-header">
          Events ({events.length})
        </h3>
        <div
          className="region-page-events-container"
          ref={eventsContainerRef}
        >
        {events.length > 0 ? (
          <div className="region-page-events-list">
            {dateOptions.map((option) => {
              const dayEvents = eventsByDate.get(option.dateKey) || [];
              if (dayEvents.length === 0) return null;

              return (
                <div key={option.id} id={option.id} className="region-date-section">
                  <div className="region-date-header">
                    <h4 className="region-date-header-title">{option.label}</h4>
                  </div>
                  <div className="region-date-events">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id || event._id}
                        data-event-id={event.id || event._id}
                      >
                        <RealListItem event={event} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="region-page-no-events">Keine Events gefunden</p>
        )}
        </div>
      </div>

      <div
        className={`region-page-images-container-small ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => imagesInputRef.current?.click()}
      >
        {/* {region.images && region.images.length > 0 ? (
          <>
            {region.images.slice(0, 3).map((image, index) => (
              <div key={index} className="region-page-image-item-small">
                <img src={image} alt={`${region.name} ${index + 1}`} />
              </div>
            ))}
            {region.images.length > 3 && (
              <div className="region-page-image-item-small region-page-more-images">
                <span>+{region.images.length - 3}</span>
              </div>
            )}
            <div className="region-page-add-image-placeholder-small">
              <Plus size={20} />
            </div>
          </>
        ) : (
          <div className="region-page-add-image-placeholder-small">
            <Plus size={20} />
          </div>
        )} */}
        {isUploadingImages && (
          <div className="region-page-upload-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        <input
          ref={imagesInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImagesChange}
          style={{ display: "none" }}
        />
      </div>

      {similarRegions.length > 0 && (
        <div className="region-page-similar-section">
          <h3 className="region-page-similar-title">Ähnliche Städte</h3>
          <div className="region-page-similar-container">
            {similarRegions.map((similarRegion) => (
              <span
                key={similarRegion.id}
                className="region-page-similar-bubble"
                onClick={() => navigate(`/region/${similarRegion.slug}`)}
              >
                {similarRegion.name}
              </span>
            ))}
          </div>
        </div>
      )}
<Footer />
    </div>
  );
};
