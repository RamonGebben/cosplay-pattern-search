import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { PatternDoc } from '@/lib/types';
import { deriveTagsFromPattern } from '@/lib/tagger';

const BASE = 'https://www.indigopatterns.com';
const START_PAGE = 1;

export const scrapeIndigoPatterns = async (): Promise<PatternDoc[]> => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: PatternDoc[] = [];

  let currentPage = START_PAGE;

  while (true) {
    const url = `${BASE}/shop?page=${currentPage}`;
    console.log(`[indigopatterns] Scraping page ${currentPage}: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    const $ = cheerio.load(html);

    // ❌ Exit if "We don’t have any products to show here right now."
    const noProducts = $('h2[data-hook="empty-gallery-title"]')
      .text()
      .includes('We don’t have any products');
    if (noProducts) break;

    $('li[data-hook="product-list-grid-item"]').each((_, el) => {
      const $el = $(el);

      const title = $el.find('[data-hook="product-item-name"]').text().trim();
      const href =
        $el.find('a[data-hook="product-item-container"]').attr('href') || '';
      const price =
        $el
          .find('[data-hook="product-item-price-to-pay"]')
          .first()
          .text()
          .trim() ||
        $el
          .find('[data-hook="product-item-price-before-discount"]')
          .first()
          .text()
          .trim();

      // High-quality image from data-image-info
      let image = '';
      const imageInfoAttr = $el.find('wow-image').attr('data-image-info');
      if (imageInfoAttr) {
        try {
          const info = JSON.parse(imageInfoAttr);
          const uri = info?.imageData?.uri;
          if (uri) {
            image = `https://static.wixstatic.com/media/${uri}/v1/fill/w_1200,h_1200,al_c,q_90/${uri}`;
          }
        } catch (err) {
          console.warn('[indigopatterns] Failed to parse image info:', err);
        }
      }

      // Fallback to low-res image if needed
      if (!image) {
        const fallback = $el.find('img').first().attr('src') || '';
        image = fallback.startsWith('http')
          ? fallback
          : fallback.startsWith('//')
          ? `https:${fallback}`
          : `${BASE}${fallback}`;
      }

      if (title && href) {
        const pattern: PatternDoc = {
          id: `indigopatterns-${href}`,
          title,
          url: href.startsWith('http') ? href : `${BASE}${href}`,
          image,
          price,
          source: 'indigopatterns.com',
          tags: [],
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
