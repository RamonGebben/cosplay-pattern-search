import { create, insert, remove, search, type Orama } from '@orama/orama';
import {
  persistToFile,
  restoreFromFile,
} from '@orama/plugin-data-persistence/server';
import fs from 'fs';
import path from 'path';
import { PatternDoc, Schema } from './types';
import { SYNONYM_GROUPS } from './synonyms';
import { singularize } from 'inflection';

// Schema definition
export const schema = {
  id: 'string',
  title: 'string',
  url: 'string',
  image: 'string',
  price: 'string',
  source: 'string',
  tags: 'string[]',
} as const;

// Path to DB file
const DB_FILE = path.resolve(process.cwd(), 'data', 'orama-db.bin');

// Global cache for DB instance
const globalForOrama = globalThis as unknown as {
  oramaDB?: Orama<Schema>;
};

// Lazy init and load from disk if possible
export const getDB = async (): Promise<Orama<Schema>> => {
  if (globalForOrama.oramaDB) return globalForOrama.oramaDB;

  let db: Orama<Schema>;

  if (fs.existsSync(DB_FILE)) {
    console.log('[Orama] Restoring DB from disk...');
    db = (await restoreFromFile('binary', DB_FILE)) as Orama<Schema>;
  } else {
    console.log('[Orama] Creating fresh DB...');
    db = await create({ schema });
  }

  globalForOrama.oramaDB = db;
  return db;
};

// Sanitize and normalize tags
const sanitizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) return [];
  return Array.from(
    new Set(
      tags
        .map(tag => (typeof tag === 'string' ? tag.trim().toLowerCase() : null))
        .filter((tag): tag is string => !!tag && tag.length > 0),
    ),
  );
};

// Index new patterns and persist to disk (in dev)
export const indexPatterns = async (patterns: PatternDoc[]): Promise<void> => {
  const db = await getDB();

  for (const pattern of patterns) {
    try {
      await remove(db, pattern.id);
    } catch (err) {
      // It's okay if it doesn't exist yet
      if (
        !(err instanceof Error && err.message.includes('DOCUMENT_NOT_FOUND'))
      ) {
        throw err;
      }
    }

    await insert(db, {
      ...pattern,
      tags: sanitizeTags(pattern.tags),
    });
  }

  if (process.env.NODE_ENV === 'development') {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await persistToFile(db, 'binary', DB_FILE);
    console.log('[Orama] DB persisted to disk (local dev)');
  } else {
    console.log('[Orama] Skipped DB persistence (production mode)');
  }
};

export const getCanonicalTag = (word: string): string | null => {
  const normalized = singularize(word.toLowerCase());
  for (const group of SYNONYM_GROUPS) {
    if (group.includes(normalized)) {
      return group[0]; // Use first in group as canonical
    }
  }
  return null;
};

// Expand query with synonyms
export const expandQueryWithSynonyms = (q: string): string => {
  const words = q.toLowerCase().split(/\s+/);

  const expanded = new Set<string>();

  for (const word of words) {
    const base = singularize(word);
    const group = SYNONYM_GROUPS.find(g => g.includes(base));

    if (group) {
      group.forEach(syn => expanded.add(syn));
    } else {
      expanded.add(base);
    }
  }

  return [...expanded].join(' ');
};

// Search interface
export const searchPatterns = async (query: string) => {
  const db = await getDB();
  return await search(db, {
    term: query,
    properties: ['title', 'tags'],
    limit: 1000,
  });
};
