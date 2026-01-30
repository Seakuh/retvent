import { Helmet } from "react-helmet-async";
import { IRegion } from "../utils";

interface RegionHelmetProps {
  region: IRegion;
  eventsCount: number;
}

export const RegionHelmet = ({ region, eventsCount }: RegionHelmetProps) => {
  if (!region) return null;

  const regionName = region.h1 || region.name;
  const description = region.metaDescription || region.description || region.introText || 
    `Entdecke ${eventsCount} ${eventsCount === 1 ? 'Event' : 'Events'} in ${regionName}. Finde die besten Veranstaltungen, Konzerte und Partys in ${regionName}.`;
  
  const fullDescription = `${description} ${eventsCount > 0 ? `${eventsCount} ${eventsCount === 1 ? 'Event' : 'Events'} verfügbar.` : ''}`;
  
  const title = `${regionName} - ${eventsCount} ${eventsCount === 1 ? 'Event' : 'Events'} | EventScanner`;
  
  const regionUrl = `https://event-scanner.com/region/${region.slug}`;
  const imageUrl = region.logoUrl || region.images?.[0] || "https://event-scanner.com/social-share.png";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={fullDescription} />
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#000000" />

      {/* Keywords */}
      <meta
        name="keywords"
        content={`${regionName}, Events, ${region.country || ''}, Konzerte, Partys, Veranstaltungen, Festivals, Live Events, Event Finder, ${region.city || ''}`}
      />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={regionUrl} />
      <meta property="og:site_name" content="EventScanner" />
      <meta property="og:locale" content="de_DE" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@eventscanner" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:url" content={regionUrl} />

      {/* Additional Meta Tags */}
      <meta name="author" content="EventScanner" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={regionUrl} />

      {/* Geo Tags */}
      {region.coordinates && (
        <>
          <meta name="geo.region" content={region.country || ""} />
          <meta name="geo.placename" content={regionName} />
          <meta name="geo.position" content={`${region.coordinates.latitude};${region.coordinates.longitude}`} />
          <meta name="ICBM" content={`${region.coordinates.latitude}, ${region.coordinates.longitude}`} />
        </>
      )}
    </Helmet>
  );
};
