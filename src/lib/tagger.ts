import { Tag, TAG_KEYWORDS } from './tags';
import { SYNONYM_GROUPS } from './synonyms';
import { PatternDoc } from './types';
import pluralize from 'pluralize';

// Sanitize and normalize tags (deduplication, lowercase, trimmed)
const sanitizeTags = (tags: unknown[]): Tag[] => {
  return Array.from(
    new Set(
      tags
        .map(tag => (typeof tag === 'string' ? tag.trim().toLowerCase() : null))
        .filter((tag): tag is Tag => !!tag && tag.length > 0),
    ),
  );
};

export const deriveTagsFromPattern = ({
  title,
  url,
  image,
  source,
}: PatternDoc): Tag[] => {
  const tags = new Set<Tag>();
  const haystack = `${title} ${url ?? ''} ${image ?? ''}`.toLowerCase();

  // Fixed tags by source
  const fixedTagsBySource: Record<string, Tag[]> = {
    'sksprops.com': ['foam'],
    'kamuicosplay.com': ['foam'],
    'princearmoryacademy.com': ['leather', 'foam', 'fantasy'],
    'blacksnailpatterns.com': ['historical', 'sewing'],
    'indigopatterns.com': ['sewing'],
    'missviscid-designs.com': ['sewing', 'fantasy'],
    'ndlwrkshop.com': ['sewing'],
  };

  fixedTagsBySource[source ?? '']?.forEach(tag => tags.add(tag));

  // Flatten synonym groups into a map of keyword → canonical tag
  const synonymToTag: Record<string, Tag> = {};
  for (const group of SYNONYM_GROUPS) {
    const canonical = group[0];
    group.forEach(variant => {
      synonymToTag[variant] = canonical as Tag;
      synonymToTag[pluralize.singular(variant)] = canonical as Tag;
      synonymToTag[pluralize.plural(variant)] = canonical as Tag;
    });
  }

  // Combine synonyms and keywords
  const allKeywordMap: Record<string, Tag> = {};
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    keywords.forEach(kw => {
      allKeywordMap[kw] = tag as Tag;
      allKeywordMap[pluralize.singular(kw)] = tag as Tag;
      allKeywordMap[pluralize.plural(kw)] = tag as Tag;
    });
  }

  // Merge maps: synonym map overrides keyword map if overlap
  const keywordMap = { ...allKeywordMap, ...synonymToTag };

  // Search haystack
  for (const [kw, tag] of Object.entries(keywordMap)) {
    if (haystack.includes(kw)) {
      tags.add(tag);
    }
  }

  return sanitizeTags([...tags]);
};
