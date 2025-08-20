import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import type { PatternDoc } from '../../orama';

const BASE = 'https://ndlwrkshop.com';
const START_PAGE = 1;

export const scrapeNdlwrkshop = async (): Promise<PatternDoc[]> => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: PatternDoc[] = [];

  let currentPage = START_PAGE;

  while (true) {
    const url = `${BASE}/collections/single-item-patterns?page=${currentPage}`;
    console.log(`[ndlwrkshop] Scraping page ${currentPage}: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    const $ = cheerio.load(html);

    // ❌ Exit if "No products found"
    const noProducts = $('h2.title.title--primary').text().includes('No products found');
    if (noProducts) break;

    $('#product-grid .product-card-wrapper').each((_, el) => {
      const $el = $(el);

      const title = $el.find('a.full-unstyled-link').text().trim();
      const href = $el.find('a.full-unstyled-link').attr('href') || '';
      const image = $el.find('.media img').first().attr('src') || '';
      const price =
        $el.find('.price-item--sale').first().text().trim() ||
        $el.find('.price-item--regular').first().text().trim();

      if (title && href) {
        results.push({
          id: `ndlwrkshop-${href}`,
          title,
          url: href.startsWith('http') ? href : `${BASE}${href}`,
          image: image.startsWith('http') ? image : `https:${image}`,
          price,
          source: 'ndlwrkshop.com',
          tags: [],
        });
      }
    });

    currentPage++;
  }

  await browser.close();
  return results;
};
