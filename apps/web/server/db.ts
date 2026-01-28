import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export function openDb(dbPath: string) {
  // Ensure parent directory exists (important for Next.js build/runtime environments)
  const dir = path.dirname(dbPath);
  if (dir && dir !== '.' && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      kind TEXT NOT NULL,
      title TEXT,
      url TEXT,
      publishedAt INTEGER,
      content TEXT,
      rawJson TEXT,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analyses (
      itemId TEXT PRIMARY KEY,
      summary TEXT NOT NULL,
      entitiesJson TEXT,
      sentiment REAL,
      impact TEXT,
      predictionsJson TEXT,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY(itemId) REFERENCES items(id) ON DELETE CASCADE
    );
  `);

  return db;
}
