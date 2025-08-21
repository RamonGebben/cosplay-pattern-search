import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { PatternDoc } from '@/lib/types';
import { deriveTagsFromPattern } from '@/lib/tagger';

export const scrapeKamui = async (): Promise<PatternDoc[]> => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: PatternDoc[] = [];

  let currentPage = 1;

  while (true) {
    const url = `https://www.kamuicosplay.com/product-category/patterns/?product-page=${currentPage}`;
    console.log(`[kamui] Visiting: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const html = await page.content();
    const $ = cheerio.load(html);
    const products = $('li.product');

    // Stop if we see a "no results" message or no products
    const isEndPage = $('.not-found-title').length > 0 || products.length === 0;
    if (isEndPage) break;

    products.each((_, el) => {
      const $el = $(el);

      const url =
        $el.find('a.woocommerce-LoopProduct-link').attr('href')?.trim() || '';
      const title = $el.find('.woocommerce-loop-product__title').text().trim();
      const image = $el.find('img').first().attr('src')?.trim() || '';
      const price = $el.find('.price').text().trim();

      if (url && title) {
        const pattern: PatternDoc = {
          id: `kamui-${url}`,
          title,
          url,
          image,
          price,
          source: 'kamuicosplay.com',
          tags: ['foam'],
        };
        const _tags = deriveTagsFromPattern(pattern);

        results.push({ ...pattern, tags: _tags });
      }
    });

    currentPage++;
  }

  await browser.close();
  return results;
};
