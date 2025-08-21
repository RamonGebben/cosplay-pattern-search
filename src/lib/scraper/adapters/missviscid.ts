import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { PatternDoc } from '@/lib/types';
import { deriveTagsFromPattern } from '@/lib/tagger';

const BASE = 'https://www.missviscid-designs.com';
const ALL_PATTERNS_URL = `${BASE}/page-en/all-patterns-18390`;

export const scrapeMissviscid = async (): Promise<PatternDoc[]> => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: PatternDoc[] = [];

  console.log(`[missviscid] Scraping: ${ALL_PATTERNS_URL}`);
  await page.goto(ALL_PATTERNS_URL, { waitUntil: 'domcontentloaded' });
  const html = await page.content();
  const $ = cheerio.load(html);

  $('.product-list a.product-block').each((_, el) => {
    const $el = $(el);

    const href = $el.attr('href') || '';
    const title = $el.find('.caption-left .ellipsis').first().text().trim();
    const imageWebp = $el.find('source').attr('srcset') || '';
    const imageFallback = $el.find('img').attr('src') || '';
    const price = $el.find('.product-price').text().trim();

    if (href && title) {
      const pattern: PatternDoc = {
        id: `missviscid-${href}`,
        title,
        url: href.startsWith('http') ? href : `${BASE}${href}`,
        image: imageWebp.startsWith('http') ? imageWebp : imageFallback,
        price,
        source: 'missviscid-designs.com',
        tags: [],
      };
      const _tags = deriveTagsFromPattern(pattern);
      results.push({ ...pattern, tags: _tags });
    }
  });

  await browser.close();
  return results;
};
