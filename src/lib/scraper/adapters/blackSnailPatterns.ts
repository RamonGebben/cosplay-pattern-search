import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

import { deriveTagsFromPattern } from '@/lib/tagger';
import { PatternDoc } from '@/lib/types';

const BASE = 'https://blacksnailpatterns.com';
const COLLECTIONS = [
  '/en/collections/pdf-men-1700-1820',
  '/en/collections/pdf-men-1820-1860',
  '/en/collections/pdf-men-1860-1910',
  '/en/collections/pdf-women-1700-1790',
  '/en/collections/pdf-women-1790-1820',
  '/en/collections/pdf-women-1820-1860',
  '/en/collections/pdf-women-1860-1910',
  '/en/collections/pdf-kinder',
];

export const scrapeBlackSnailPatterns = async (): Promise<PatternDoc[]> => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: PatternDoc[] = [];

  for (const path of COLLECTIONS) {
    const url = `${BASE}${path}`;
    console.log(`[black-snail] Scraping: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const html = await page.content();
    const $ = cheerio.load(html);

    $('#product-grid li.grid__item').each((_, el) => {
      const $el = $(el);
      const anchor = $el.find('a.full-unstyled-link');
      const title = anchor.text().trim();
      const href = anchor.attr('href') || '';
      const price =
        $el.find('.price-item--sale').first().text().trim() ||
        $el.find('.price-item--regular').first().text().trim();
      const img = $el.find('.card__media img').first().attr('src') || '';

      if (title && href) {
        const pattern = {
          id: `black-snail-${href}`,
          title,
          url: href.startsWith('http') ? href : `${BASE}${href}`,
          image: img.startsWith('http') ? img : `https:${img}`,
          price,
          source: 'blacksnailpatterns.com',
          tags: [],
        };
        const _tags = deriveTagsFromPattern(pattern);
        results.push({ ...pattern, tags: _tags });
      }
    });
  }

  await browser.close();
  return results;
};
