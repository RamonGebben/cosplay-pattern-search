import { create, insert, remove, search, type Orama } from '@orama/orama';
import {
  persistToFile,
  restoreFromFile,
} from '@orama/plugin-data-persistence/server';
import { restore } from '@orama/plugin-data-persistence';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
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

// Path used for dev persistence
const DB_FILE = path.resolve(process.cwd(), 'public', 'data', 'orama-db.bin');

// Global DB cache
const globalForOrama = globalThis as unknown as {
  oramaDB?: Orama<Schema>;
};

export const getDB = async (): Promise<Orama<Schema>> => {
  if (globalForOrama.oramaDB) return globalForOrama.oramaDB;

  let db: Orama<Schema>;

  if (process.env.NODE_ENV === 'development') {
    if (fs.existsSync(DB_FILE)) {
      console.log('[Orama] Restoring DB from local file...');
      db = (await restoreFromFile('binary', DB_FILE)) as Orama<Schema>;
    } else {
      console.log('[Orama] Creating new DB (no local file found)...');
      db = await create({ schema });
    }
  } else {
    console.log('[Orama] Fetching prebuilt DB from public directory...');
    const url = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/data/orama-db.bin`
      : `http://localhost:3000/data/orama-db.bin`;
    console.log('[Orama] DB URL:', url);
    const res = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
    });
    console.log(
      '[Orama] Restoring DB from remote file...',
      res.data.byteLength,
      'bytes',
    );
    db = (await restore('binary', Buffer.from(res.data))) as Orama<Schema>;
  }

  globalForOrama.oramaDB = db;
  return db;
};

// Tag cleanup
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

// Index patterns and persist in dev
export const indexPatterns = async (patterns: PatternDoc[]): Promise<void> => {
  const db = await getDB();

  for (const pattern of patterns) {
    try {
      await remove(db, pattern.id);
    } catch (err) {
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

// Tag normalization
export const getCanonicalTag = (word: string): string | null => {
  const normalized = singularize(word.toLowerCase());
  for (const group of SYNONYM_GROUPS) {
    if (group.includes(normalized)) {
      return group[0];
    }
  }
  return null;
};

// Expand search terms with synonyms
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

// Pattern search
export const searchPatterns = async (query: string) => {
  const db = await getDB();
  return await search(db, {
    term: query,
    properties: ['title', 'tags'],
    limit: 1000,
  });
};
