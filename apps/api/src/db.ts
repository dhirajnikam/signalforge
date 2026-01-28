import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export type DB = Database.Database;

export function openDb(sqlitePath: string): DB {
  const dir = path.dirname(sqlitePath);
  fs.mkdirSync(dir, { recursive: true });
  const db = new Database(sqlitePath);
  db.pragma('journal_mode = WAL');
  migrate(db);
  return db;
}

function migrate(db: DB) {
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
      summary TEXT,
      entitiesJson TEXT,
      sentiment REAL,
      impact TEXT,
      predictionsJson TEXT,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY(itemId) REFERENCES items(id)
    );

    CREATE INDEX IF NOT EXISTS idx_items_publishedAt ON items(publishedAt);
  `);
}
