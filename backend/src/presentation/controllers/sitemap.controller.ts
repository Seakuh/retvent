import { Controller, Get, Req, Header } from '@nestjs/common';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  generateSitemap,
  generateSitemapIndex,
  generateEventUrls,
  generateCityUrls,
} from '../../infrastructure/utils/sitemap.util';

@Controller()
export class SitemapController {
  constructor(
    @InjectModel('Event') private readonly eventModel: Model<any>,
  ) {}

  /**
   * Sitemap-Index
   * GET /sitemap.xml
   */
  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  async getSitemapIndex(@Req() req: Request) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const today = new Date().toISOString().split('T')[0];

    const sitemaps = [
      {
        loc: `${baseUrl}/sitemap-events.xml`,
        lastmod: today,
      },
      {
        loc: `${baseUrl}/sitemap-cities.xml`,
        lastmod: today,
      },
    ];

    const sitemapIndexXml = generateSitemapIndex(sitemaps);
    return sitemapIndexXml;
  }

  /**
   * Event-Sitemap
   * GET /sitemap-events.xml
   */
  @Get('sitemap-events.xml')
  @Header('Content-Type', 'application/xml')
  async getEventSitemap(@Req() req: Request) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const now = new Date();

    // Nur kommende Events (oder Events der letzten 7 Tage)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    try {
      const events = await this.eventModel
        .find({
          $or: [
            { status: 'published' },
            { status: { $exists: false } }, // Für abwärtskompatibilität
          ],
          startDate: { $gte: sevenDaysAgo },
        })
        .select('id _id slug startDate updatedAt')
        .limit(50000)
        .lean()
        .exec();

      const urls = generateEventUrls(events, baseUrl);
      const sitemapXml = generateSitemap(urls);

      return sitemapXml;
    } catch (error) {
      console.error('Fehler beim Generieren der Event-Sitemap:', error);
      // Fallback: Leere Sitemap zurückgeben
      return generateSitemap([]);
    }
  }

  /**
   * Stadt-Sitemap
   * GET /sitemap-cities.xml
   */
  @Get('sitemap-cities.xml')
  @Header('Content-Type', 'application/xml')
  async getCitySitemap(@Req() req: Request) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    try {
      const cities = await this.eventModel
        .distinct('citySlug', {
          citySlug: { $exists: true, $ne: null },
        })
        .exec();

      const urls = generateCityUrls(cities, baseUrl);
      const sitemapXml = generateSitemap(urls);

      return sitemapXml;
    } catch (error) {
      console.error('Fehler beim Generieren der Stadt-Sitemap:', error);
      // Fallback: Leere Sitemap zurückgeben
      return generateSitemap([]);
    }
  }
}
