import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RealListItem } from "../components/EventGallery/Items/RealListItem";
import { Event, IRegion } from "../utils";
import "./RegionPage.css";
import { getRegion, getRegionEvents, uploadRegionLogo, uploadRegionImages } from "./service";
import { ChevronLeft, Plus, Navigation, X, Info, Edit } from "lucide-react";
import { RegionSearchModal } from "./RegionSearchModal";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";
import { Icon, divIcon } from "leaflet";

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
  const [showRegionSearchModal, setShowRegionSearchModal] = useState(false);
  const navigate = useNavigate();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const regionSearchInputRef = useRef<HTMLInputElement>(null);
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
            <button onClick={() => navigate("/")} className="back-button">
        <ChevronLeft className="h-5 w-5" />{" "}
      </button>
      <div className="region-page-header">
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
                </div>
                <div className="region-page-header-icons">
                  {(region.description || region.introText) && (
                    <button
                      className="region-page-info-icon"
                      onClick={() => setShowDescriptionModal(true)}
                      aria-label="Show description"
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
                <button
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
                </button>
              </div>
              <div className="region-page-events-header">
                <h2 className="region-page-events-title-header">
                  Upcoming Events
                  <span className="region-page-events-count-header">({events.length})</span>
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* {region.coordinates && (
        <div className="region-page-map-container">
          <MapContainer
            center={[region.coordinates.latitude, region.coordinates.longitude]}
            zoom={10}
            className="region-page-map"
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[region.coordinates.latitude, region.coordinates.longitude]}
              icon={divIcon({
                className: 'region-marker-icon',
                html: '<div class="region-marker-pin"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 20],
              })}
            >
              <Popup>{region.name}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )} */}

      {region.vibe && (
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

      <div className="region-page-events-container">
        {events.length > 0 ? (
          <div className="region-page-events-list">
            {events.map((event) => (
              <RealListItem key={event.id || event._id} event={event} />
            ))}
          </div>
        ) : (
          <p className="region-page-no-events">Keine Events gefunden</p>
        )}
      </div>

      <div
        className={`region-page-images-container-small ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => imagesInputRef.current?.click()}
      >
        {region.images && region.images.length > 0 ? (
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
        )}
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

    </div>
  );
};
