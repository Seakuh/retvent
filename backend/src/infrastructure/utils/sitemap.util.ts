export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

export interface SitemapIndexEntry {
  loc: string;
  lastmod?: string;
}

/**
 * Generiert eine Sitemap XML aus URLs
 */
export function generateSitemap(urls: SitemapUrl[]): string {
  const urlElements = urls
    .map((url) => {
      const lastmod = url.lastmod
        ? `    <lastmod>${url.lastmod}</lastmod>\n`
        : '';
      const changefreq = url.changefreq
        ? `    <changefreq>${url.changefreq}</changefreq>\n`
        : '';
      const priority =
        url.priority !== undefined
          ? `    <priority>${url.priority}</priority>\n`
          : '';

      return `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n${lastmod}${changefreq}${priority}  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

/**
 * Generiert einen Sitemap-Index XML
 */
export function generateSitemapIndex(sitemaps: SitemapIndexEntry[]): string {
  const sitemapElements = sitemaps
    .map((sitemap) => {
      const lastmod = sitemap.lastmod
        ? `    <lastmod>${sitemap.lastmod}</lastmod>\n`
        : '';
      return `  <sitemap>\n    <loc>${escapeXml(sitemap.loc)}</loc>\n${lastmod}  </sitemap>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
}

/**
 * Generiert URLs für Events
 */
export function generateEventUrls(
  events: Array<{
    id?: string;
    _id?: any;
    slug?: string;
    startDate?: Date | string;
    updatedAt?: Date | string;
  }>,
  baseUrl: string = 'https://event-scanner.com',
): SitemapUrl[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  return events.map((event) => {
    const eventDate = event.startDate
      ? new Date(event.startDate)
      : null;

    let priority = 0.5;
    let changefreq = 'monthly';

    if (eventDate) {
      if (eventDate > now) {
        priority = 1.0;
        changefreq = 'daily';
      } else if (
        eventDate >
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      ) {
        priority = 0.8;
        changefreq = 'weekly';
      } else if (
        eventDate >
        new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      ) {
        priority = 0.5;
        changefreq = 'monthly';
      } else {
        priority = 0.3;
        changefreq = 'never';
      }
    }

    const lastmod = event.updatedAt
      ? new Date(event.updatedAt).toISOString().split('T')[0]
      : today;

    const eventId =
      event._id?.toString() || event.id || '';
    const slug = event.slug || '';
    const urlPath = slug && eventId
      ? `/event/${slug}-${eventId}`
      : `/event/${eventId}`;

    return {
      loc: `${baseUrl}${urlPath}`,
      lastmod,
      changefreq,
      priority,
    };
  });
}

/**
 * Generiert URLs für Städte
 */
export function generateCityUrls(
  cities: string[],
  baseUrl: string = 'https://event-scanner.com',
): SitemapUrl[] {
  const today = new Date().toISOString().split('T')[0];

  return cities.map((city) => ({
    loc: `${baseUrl}/events/${city}`,
    lastmod: today,
    changefreq: 'daily',
    priority: 0.8,
  }));
}

/**
 * Escaped XML-spezielle Zeichen
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
