
import { scrapeKinpatsu } from './adapters/kinpatsu';
import { scrapeNdlwrkshop } from './adapters/ndlwrkshop';
import { scrapeMissviscid } from './adapters/missviscid';
import { scrapeBlackSnailPatterns } from './adapters/blackSnailPatterns';
import { scrapeIndigoPatterns } from './adapters/indigoPatterns';
import { scrapeSksProps } from './adapters/sksProps';
import { scrapePrinceArmoryAcademy } from './adapters/princearmoryacademy';
import { scrapeKamui } from './adapters/kamuiCosplay';
import { PatternDoc } from '../types';

// List of all scrapers
const scrapers: { shop: string; scraper: () => Promise<PatternDoc[]> }[] = [
  { shop: 'SKS Props', scraper: scrapeSksProps },
  { shop: 'Prince Armory Academy', scraper: scrapePrinceArmoryAcademy },
  { shop: 'Indigo Patterns', scraper: scrapeIndigoPatterns },
  { shop: 'Black Snail Patterns', scraper: scrapeBlackSnailPatterns },
  { shop: 'Miss Viscid', scraper: scrapeMissviscid },
  { shop: 'NDLWRKSHOP', scraper: scrapeNdlwrkshop },
  { shop: 'Kinpatsu', scraper: scrapeKinpatsu },
  { shop: 'Kamui Cosplay', scraper: scrapeKamui },
];

export const runAllScrapers = async (): Promise<PatternDoc[]> => {
  const allResults: PatternDoc[] = [];

  for (const { shop, scraper } of scrapers) {
    try {
      console.log(`[${shop}] Running scraper...`);
      const results = await scraper();
      console.log(`[${shop}] Scraped ${results.length} items.`);
      allResults.push(...results);
    } catch (err) {
      console.error(`[${shop}] Scraper failed:`, err);
    }
  }

  return allResults;
};
