import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { deriveTagsFromPattern } from '@/lib/tagger';
import { PatternDoc } from '@/lib/types';

export const scrapeKinpatsu = async (): Promise<PatternDoc[]> => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Load all products at once using the ?per_page trick
  await page.goto(
    'https://kinpatsucosplay.com/products/?per_page=999&layout=list',
    {
      waitUntil: 'domcontentloaded',
    },
  );

  const html = await page.content();
  const $ = cheerio.load(html);
  const results: PatternDoc[] = [];

  $('li.mfn-product-li-item').each((_, el) => {
    const $el = $(el);

    const url = $el.find('a').first().attr('href')?.trim() || '';
    const title = $el.find('h2.title a').text().trim();
    const image = $el.find('img').attr('src')?.trim() || '';
    const price = $el.find('.price').text().trim();

    if (title && url) {
      const pattern: PatternDoc = {
        id: `kinpatsu-${url}`,
        title,
        url,
        image: image.startsWith('http') ? image : `https:${image}`,
        price,
        source: 'kinpatsucosplay.com',
        tags: [],
      };
      const _tags = deriveTagsFromPattern(pattern);

      results.push({ ...pattern, tags: _tags });
    }
  });

  await browser.close();
  return results;
};
