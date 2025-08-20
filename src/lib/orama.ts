import { create, insert, remove, search, type Orama } from '@orama/orama';
import {
  persistToFile,
  restoreFromFile,
} from '@orama/plugin-data-persistence/server';
import fs from 'fs';
import path from 'path';

// 1. Schema definition
const schema = {
  id: 'string',
  title: 'string',
  url: 'string',
  image: 'string',
  price: 'string',
  source: 'string',
  tags: 'string[]',
} as const;

type Schema = typeof schema;

// 2. Document type
export type PatternDoc = {
  id: string;
  title: string;
  url: string;
  image: string;
  price: string;
  source: string;
  tags: string[];
};

// 3. Path to DB file
const DB_FILE = path.resolve(process.cwd(), 'data', 'orama-db.bin');

// 4. Global cache for DB instance
const globalForOrama = globalThis as unknown as {
  oramaDB?: Orama<Schema>;
};

// 5. Lazy init and load from disk if possible
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

// 6. Index new patterns and persist to disk (in dev)
export const indexPatterns = async (patterns: PatternDoc[]): Promise<void> => {
  const db = await getDB();

  for (const pattern of patterns) {
  try {
    await remove(db, pattern.id);
  } catch (err) {
    // It's okay if it doesn't exist yet
    if (!(err instanceof Error && err.message.includes('DOCUMENT_NOT_FOUND'))) {
      throw err;
    }
  }
  await insert(db, pattern);
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

// 7. Search interface
export const searchPatterns = async (query: string) => {
  const db = await getDB();
  return await search(db, {
    term: query,
    properties: ['title', 'tags'],
  });
};
