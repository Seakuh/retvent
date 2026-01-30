import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RealListItem } from "../components/EventGallery/Items/RealListItem";
import { SocialSearchButtons } from "../components/EventDetail/components/SocialSearchButtons";
import { Event, IRegion } from "../utils";
import "./RegionPage.css";
import { getRegion, getRegionEvents } from "./service";

export const RegionPage = () => {
  const { regionSlug } = useParams();
  const [region, setRegion] = useState<IRegion | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
      <div className="region-page-header">
        <div className="region-page-header-content">
          {region.logoUrl && (
            <div className="region-page-logo-container">
              <img src={region.logoUrl} alt={region.name} />
            </div>
          )}
          <div className="region-page-title-container">
            <h1 className="region-page-title">{region.h1 || region.name}</h1>
            <SocialSearchButtons title={region.name} />
          </div>
        </div>
      </div>

      {region.introText && (
        <div className="region-page-intro-container">
          <p>{region.introText}</p>
        </div>
      )}

      {region.description && (
        <div className="region-page-description-container">
          <p>{region.description}</p>
        </div>
      )}

      {region.images && region.images.length > 0 && (
        <div className="region-page-images-container">
          {region.images.map((image, index) => (
            <div key={index} className="region-page-image-item">
              <img src={image} alt={`${region.name} ${index + 1}`} />
            </div>
          ))}
        </div>
      )}

      {(region.address || region.country || region.coordinates) && (
        <div className="region-page-location-container">
          {region.address && <p><strong>Adresse:</strong> {region.address}</p>}
          {region.country && <p><strong>Land:</strong> {region.country}</p>}
          {region.coordinates && (
            <p>
              <strong>Koordinaten:</strong> {region.coordinates.latitude}, {region.coordinates.longitude}
            </p>
          )}
        </div>
      )}

      {region.vibe && (
        <div className="region-page-vibe-container">
          <p><strong>Vibe:</strong></p>
          <div className="region-page-vibe-details">
            {region.vibe.energy !== undefined && (
              <p><strong>Energy:</strong> {region.vibe.energy}/100</p>
            )}
            {region.vibe.intimacy !== undefined && (
              <p><strong>Intimacy:</strong> {region.vibe.intimacy}/100</p>
            )}
            {region.vibe.exclusivity !== undefined && (
              <p><strong>Exclusivity:</strong> {region.vibe.exclusivity}/100</p>
            )}
            {region.vibe.social !== undefined && (
              <p><strong>Social:</strong> {region.vibe.social}/100</p>
            )}
          </div>
        </div>
      )}

      {region.parentRegion && (
        <div className="region-page-parent-container">
          <p><strong>Übergeordnete Region:</strong> {region.parentRegion}</p>
        </div>
      )}

      <div className="region-page-events-container">
        <h2 className="region-page-events-title">Events in {region.name}</h2>
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
    </div>
  );
};
