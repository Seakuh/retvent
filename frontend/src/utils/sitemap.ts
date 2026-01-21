/**
 * Sitemap-Generierung für SEO
 * Generiert dynamische Sitemaps für Events, Städte, Venues, etc.
 */

import { Event } from "../utils";

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export interface SitemapIndex {
  sitemap: Array<{
    loc: string;
    lastmod?: string;
  }>;
}

/**
 * Generiert eine Sitemap-XML aus URLs
 */
export function generateSitemap(urls: SitemapUrl[]): string {
  const urlElements = urls
    .map((url) => {
      const lastmod = url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>\n` : "";
      const changefreq = url.changefreq ? `    <changefreq>${url.changefreq}</changefreq>\n` : "";
      const priority = url.priority !== undefined ? `    <priority>${url.priority}</priority>\n` : "";

      return `  <url>\n    <loc>${url.loc}</loc>\n${lastmod}${changefreq}${priority}  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

/**
 * Generiert eine Sitemap-Index-XML
 */
export function generateSitemapIndex(sitemaps: Array<{ loc: string; lastmod?: string }>): string {
  const sitemapElements = sitemaps
    .map((sitemap) => {
      const lastmod = sitemap.lastmod ? `    <lastmod>${sitemap.lastmod}</lastmod>\n` : "";
      return `  <sitemap>\n    <loc>${sitemap.loc}</loc>\n${lastmod}  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
}

/**
 * Generiert Event-URLs für Sitemap
 */
export function generateEventUrls(events: Event[]): SitemapUrl[] {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  return events.map((event) => {
    const eventDate = event.startDate
      ? typeof event.startDate === "string"
        ? new Date(event.startDate)
        : event.startDate
      : null;

    // Bestimme Priorität basierend auf Event-Status
    let priority = 0.5;
    let changefreq: SitemapUrl["changefreq"] = "monthly";

    if (eventDate) {
      if (eventDate > now) {
        // Kommendes Event
        priority = 1.0;
        changefreq = "daily";
      } else if (eventDate > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        // Letzte 7 Tage
        priority = 0.8;
        changefreq = "weekly";
      } else if (eventDate > new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)) {
        // Letzte 90 Tage
        priority = 0.5;
        changefreq = "monthly";
      } else {
        // Älter als 90 Tage
        priority = 0.3;
        changefreq = "never";
      }
    }

    const lastmod = event.updatedAt
      ? typeof event.updatedAt === "string"
        ? new Date(event.updatedAt).toISOString().split("T")[0]
        : event.updatedAt.toISOString().split("T")[0]
      : today;

    return {
      loc: `https://event-scanner.com/event/${event.id || event._id}`,
      lastmod,
      changefreq,
      priority,
    };
  });
}

/**
 * Generiert Stadt-URLs für Sitemap
 */
export function generateCityUrls(cities: string[]): SitemapUrl[] {
  const today = new Date().toISOString().split("T")[0];

  return cities.map((city) => ({
    loc: `https://event-scanner.com/events/${city.toLowerCase()}`,
    lastmod: today,
    changefreq: "daily" as const,
    priority: 0.8,
  }));
}

/**
 * Generiert Kategorie-URLs für Sitemap
 */
export function generateCategoryUrls(
  cities: string[],
  categories: string[]
): SitemapUrl[] {
  const today = new Date().toISOString().split("T")[0];
  const urls: SitemapUrl[] = [];

  cities.forEach((city) => {
    categories.forEach((category) => {
      urls.push({
        loc: `https://event-scanner.com/events/${city.toLowerCase()}/${category.toLowerCase()}`,
        lastmod: today,
        changefreq: "daily" as const,
        priority: 0.7,
      });
    });
  });

  return urls;
}

/**
 * Generiert Venue-URLs für Sitemap
 */
export function generateVenueUrls(venues: Array<{ slug: string; name: string }>): SitemapUrl[] {
  const today = new Date().toISOString().split("T")[0];

  return venues.map((venue) => ({
    loc: `https://event-scanner.com/venue/${venue.slug}`,
    lastmod: today,
    changefreq: "weekly" as const,
    priority: 0.7,
  }));
}

/**
 * Generiert Künstler-URLs für Sitemap
 */
export function generateArtistUrls(
  artists: Array<{ slug: string; name: string }>
): SitemapUrl[] {
  const today = new Date().toISOString().split("T")[0];

  return artists.map((artist) => ({
    loc: `https://event-scanner.com/artist/${artist.slug}`,
    lastmod: today,
    changefreq: "weekly" as const,
    priority: 0.6,
  }));
}

/**
 * Generiert Community-URLs für Sitemap
 */
export function generateCommunityUrls(cities: string[]): SitemapUrl[] {
  const today = new Date().toISOString().split("T")[0];

  return cities.map((city) => ({
    loc: `https://event-scanner.com/community/${city.toLowerCase()}`,
    lastmod: today,
    changefreq: "daily" as const,
    priority: 0.5,
  }));
}
