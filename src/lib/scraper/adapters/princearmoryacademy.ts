import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

import { deriveTagsFromPattern } from '@/lib/tagger';
import { PatternDoc } from '@/lib/types';

export const scrapePrinceArmoryAcademy = async (): Promise<PatternDoc[]> => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: PatternDoc[] = [];

  const blocklist = new Set(
    [
      '8 PC Powered Beveler Tips',
      'Leather Stamp Tool Holders Gen 1',
      'Fluting Wheels Gen 1',
      '3D Hydra Scales STL',
      'Gen1 & Gen 2 Leather Shaping Forms',
      'Sharpening Jig Gen 1',
      'Basic Smooth Bevelers 12PC Set Gen 1',
      'Fluting Chisel & Bases Gen 1',
      'Mandalorian Helmet',
    ].map(name => name.toLowerCase()),
  );

  let pageNum = 1;
  while (true) {
    const pageUrl =
      pageNum === 1
        ? 'https://princearmoryacademy.com/shop/'
        : `https://princearmoryacademy.com/shop/page/${pageNum}/`;

    console.log(`[princearmory] Visiting: ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });

    const html = await page.content();
    const $ = cheerio.load(html);

    const products = $('li.product');
    if (products.length === 0) break;

    products.each((_, el) => {
      const $el = $(el);
      const title = $el
        .find('h2.woocommerce-loop-product__title')
        .text()
        .trim();
      const url =
        $el.find('a.woocommerce-loop-product__link').attr('href')?.trim() || '';
      const priceText = $el
        .find('.price .amount')
        .first()
        .text()
        .replace(/[^\d.,]/g, '');
      const price = priceText ? `$${priceText}` : '';

      // Skip STL and blocklist
      if (
        !title ||
        !url ||
        blocklist.has(title.toLowerCase()) ||
        title.toLowerCase().includes('stl')
      ) {
        console.log(`[princearmory] Skipping: ${title}`);
        return;
      }

      // Smart image handling
      const imgEl = $el.find('img');
      let image = imgEl.attr('data-lazy-src') || imgEl.attr('src') || '';

      if (image.startsWith('data:image/svg+xml')) {
        console.log(`[princearmory] Skipping placeholder image for: ${title}`);
        image = ''; // Skip or optionally fallback to product page scrape later
      }

      const pattern: PatternDoc = {
        id: `princearmoryacademy-${url}`,
        title,
        url,
        image,
        price,
        source: 'princearmoryacademy.com',
        tags: ['foam', 'leather'],
      };

      const _tags = deriveTagsFromPattern(pattern);

      results.push({ ...pattern, tags: _tags });

      console.log(`[princearmory] ✓ ${title}`);
    });

    pageNum++;
  }

  await browser.close();
  return results;
};
