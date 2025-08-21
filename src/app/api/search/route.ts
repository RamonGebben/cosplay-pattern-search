import { NextResponse } from 'next/server';
import {
  expandQueryWithSynonyms,
  getCanonicalTag,
  searchPatterns,
} from '@/lib/orama';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const expandedQ = expandQueryWithSynonyms(q);

  const sources = (searchParams.get('source') || '').split(',').filter(Boolean);

  // Normalize tags to canonical forms
  const rawTags = (searchParams.get('tags') || '').split(',').filter(Boolean);
  const tags = rawTags
    .map(t => getCanonicalTag(t) || t)
    .filter((t, i, self) => self.indexOf(t) === i); // dedupe

  const priceMin = parseFloat(searchParams.get('priceMin') || '0');
  const priceMax = parseFloat(searchParams.get('priceMax') || '9999');
  const sort = searchParams.get('sort') || 'price';

  try {
    const result = await searchPatterns(expandedQ);

    const filtered = result.hits
      .map(hit => hit.document)
      .filter(doc => {
        const matchesSource =
          sources.length === 0 || sources.includes(doc.source);
        const matchesTags =
          tags.length === 0 || tags.every(tag => doc.tags?.includes(tag));
        const price = parseFloat(doc.price?.replace(/[^0-9.]/g, '') || '0');
        const matchesPrice = price >= priceMin && price <= priceMax;
        return matchesSource && matchesTags && matchesPrice;
      })
      .sort((a, b) => {
        if (sort === 'price') {
          const priceA = parseFloat(a.price?.replace(/[^0-9.]/g, '') || '0');
          const priceB = parseFloat(b.price?.replace(/[^0-9.]/g, '') || '0');
          return priceA - priceB;
        } else if (sort === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });

    return NextResponse.json({
      success: true,
      hits: filtered,
    });
  } catch (err) {
    console.error('Search failed:', err);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 },
    );
  }
}
