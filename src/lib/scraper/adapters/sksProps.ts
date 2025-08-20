import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import type { PatternDoc } from '../../orama';

const BASE = 'https://www.sksprops.com';
const URL = `${BASE}/templates`;

export const scrapeSksProps = async (): Promise<PatternDoc[]> => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: PatternDoc[] = [];

  console.log(`[sksprops] Visiting: ${URL}`);
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  const html = await page.content();
  const $ = cheerio.load(html);

  const rows = $('.row.sqs-row');
  console.log(`[sksprops] Found ${rows.length} .row.sqs-row elements`);

  rows.each((rowIndex, rowEl) => {
    const $row = $(rowEl);
    const $columns = $row.find('.col');
    console.log(`[sksprops] Row ${rowIndex} has ${$columns.length} columns`);

    $columns.each((colIndex, colEl) => {
      const $col = $(colEl);
      const pdfLink = $col.find('a[href$=".pdf"]').attr('href');

      if (!pdfLink) return;

      console.log(`[sksprops] Found PDF in col ${colIndex}: ${pdfLink}`);

      // Try to find YouTube image in the column before this one
      const ytCol = $columns.eq(colIndex - 1);
      const ytImg = ytCol.find('a[href*="youtu.be"] img').attr('src');

      if (!ytImg) {
        console.log(`[sksprops] No YouTube image found in previous column`);
        return;
      }

      const cleanUrl = pdfLink.startsWith('http') ? pdfLink : `${BASE}${pdfLink}`;
      const cleanImg = ytImg.startsWith('http') ? ytImg : `https:${ytImg}`;

      const filename = cleanUrl.split('/').pop()?.replace('.pdf', '').replace(/[-_]/g, ' ') ?? 'Unnamed';
      const title = filename.replace(/\b\w/g, (l) => l.toUpperCase()).trim();

      console.log(`[sksprops] Added pattern: ${title}`);

      results.push({
        id: `sksprops-${cleanUrl}`,
        title,
        url: cleanUrl,
        image: cleanImg,
        price: 'Free',
        source: 'sksprops.com',
        tags: ['foam'],
      });
    });
  });

  await browser.close();
  console.log(`[SKS Props] Scraped ${results.length} items.`);
  return results;
};
