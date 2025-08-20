import { NextResponse } from 'next/server';
import { runAllScrapers } from '@/lib/scraper';
import { indexPatterns } from '@/lib/orama';

export async function POST() {
  try {
    const patterns = await runAllScrapers();

    await indexPatterns(patterns);

    return NextResponse.json({
      success: true,
      indexed: patterns.length,
    });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { success: false, error: 'Scraping failed' },
      { status: 500 }
    );
  }
}
