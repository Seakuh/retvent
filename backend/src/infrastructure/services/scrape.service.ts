// import { Injectable } from '@nestjs/common';
// import { BingService } from './bing.service';

// // export async function scrapeInstagram(username: string) {
// //   const url = `https://www.instagram.com/${username}/`;

// //   const browser = await puppeteer.launch({ headless: 'new' });
// //   const page = await browser.newPage();
// //   await page.goto(url, { waitUntil: 'domcontentloaded' });

// //   // Instagram blockt Bots oft, daher nur öffentlich sichtbare Infos scrapen
// //   const data = await page.evaluate(() => {
// //     const name = document.querySelector('h1')?.textContent;
// //     const bio = document.querySelector('div.-vDIg span')?.textContent;
// //     const profileImage = document
// //       .querySelector('img[data-testid="user-avatar"]')
// //       ?.getAttribute('src');
// //     return { name, bio, profileImage };
// //   });

// //   await browser.close();
// //   return data;
// // }

// @Injectable()
// export class ScrapeService {
//   constructor(
//     private readonly scrapeService: ScrapeService,
//     private readonly bingService: BingService,
//   ) {}

//   async fetchBingInfo(name: string) {
//     const url = `https://www.bing.com/search?q=${name}`;
//     const html = await this.bingService.extractTextFromPage(url);
//     return html;
//   }

//   // Beispiel-Funktion (pseudo-code, vereinfacht)

//   // async function generateArtistProfile(name: string) {
//   //     const igData = await scrapeInstagram(name);
//   //     const scData = await scrapeSoundCloud(name);
//   //     const raData = await scrapeRA(name);
//   //     const linktreeData = await scrapeLinktree(igData.bioLink);

//   //     return {
//   //       name,
//   //       instagram: igData,
//   //       soundcloud: scData,
//   //       residentAdvisor: raData,
//   //       links: linktreeData
//   //     };
//   //   }

//   //   async scrapeSoundCloud(name: string) {
//   //     const url = `https://soundcloud.com/${name}`;
//   //     const html = await this.bingService.extractTextFromPage(url);
//   //     return html;
//   //   }
// }
