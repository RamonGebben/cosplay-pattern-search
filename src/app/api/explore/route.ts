import { NextResponse } from 'next/server';
import { getDB } from '@/lib/orama';
import { search } from '@orama/orama';

import { TAGS } from '@/lib/tags';
import type { PatternDoc } from '@/lib/types';
import { deriveTagsFromPattern } from '@/lib/tagger';

export async function GET() {
  try {
    const db = await getDB();

    const result = await search(db, {
      term: '',
      properties: ['title', 'tags'], // still search index
      limit: 10000,
    });

    const allDocs = result.hits.map(hit => hit.document as PatternDoc);

    // Build tag groups from predefined TAGS
    const groupedByTag: Record<string, PatternDoc[]> = {};
    for (const tag of TAGS) {
      groupedByTag[tag] = [];
    }

    for (const doc of allDocs) {
      const derivedTags = deriveTagsFromPattern(doc);
      for (const tag of derivedTags) {
        if (TAGS.includes(tag)) {
          groupedByTag[tag]?.push(doc);
        }
      }
    }

    // Sort each group alphabetically
    for (const tag of TAGS) {
      groupedByTag[tag].sort((a, b) =>
        a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }),
      );
    }

    return NextResponse.json({
      success: true,
      tags: groupedByTag,
    });
  } catch (err) {
    console.error('Explore fetch failed:', err);
    return NextResponse.json(
      { success: false, error: 'Explore fetch failed' },
      { status: 500 },
    );
  }
}
