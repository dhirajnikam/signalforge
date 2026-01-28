import { z } from 'zod';
import { openDb } from './db';
import { env } from './env';
import { ingestSource, type IngestedItem, type Source } from './sources';
import { analyzeItem } from './analyze';

let _db: ReturnType<typeof openDb> | null = null;
export function getDb() {
  if (!_db) _db = openDb(env.SQLITE_PATH);
  return _db;
}

function upsertItem(item: IngestedItem) {
  const stmt = getDb().prepare(`
    INSERT INTO items (id, source, kind, title, url, publishedAt, content, rawJson, createdAt)
    VALUES (@id, @source, @kind, @title, @url, @publishedAt, @content, @rawJson, @createdAt)
    ON CONFLICT(id) DO UPDATE SET
      source=excluded.source,
      kind=excluded.kind,
      title=excluded.title,
      url=excluded.url,
      publishedAt=excluded.publishedAt,
      content=excluded.content,
      rawJson=excluded.rawJson
  `);

  stmt.run({
    id: item.id,
    source: item.source,
    kind: item.kind,
    title: item.title ?? null,
    url: item.url ?? null,
    publishedAt: item.publishedAt ?? null,
    content: item.content ?? null,
    rawJson: JSON.stringify(item.raw ?? null),
    createdAt: Date.now(),
  });
}

export function parseSources(json: string): Source[] {
  try {
    const parsed = JSON.parse(json);
    return z
      .array(
        z.discriminatedUnion('kind', [
          z.object({ kind: z.literal('rss'), name: z.string(), url: z.string().url() }),
          z.object({ kind: z.literal('web'), name: z.string(), url: z.string().url() }),
          z.object({
            kind: z.literal('twitter'),
            name: z.string(),
            handle: z.string(),
            provider: z.enum(['rsshub', 'nitter', 'auto']).optional(),
          }),
        ])
      )
      .parse(parsed);
  } catch {
    return [];
  }
}

export async function runRefresh(companyOrEvent?: string) {
  const sources = parseSources(env.SOURCES_JSON);
  const all: IngestedItem[] = [];

  for (const s of sources) {
    try {
      const items = await ingestSource(s, { rsshubBaseUrl: env.RSSHUB_BASE_URL, nitterBaseUrl: env.NITTER_BASE_URL });
      for (const it of items) {
        upsertItem(it);
        all.push(it);
      }
    } catch (e) {
      console.error('source failed', s, e);
    }
  }

  const recent = getDb()
    .prepare(
      'SELECT id, source, kind, title, url, publishedAt, content, rawJson, createdAt FROM items ORDER BY COALESCE(publishedAt, createdAt) DESC LIMIT 15'
    )
    .all() as Array<any>;

  for (const row of recent) {
    const item: IngestedItem = {
      id: row.id,
      source: row.source,
      kind: row.kind,
      title: row.title ?? undefined,
      url: row.url ?? undefined,
      publishedAt: row.publishedAt ?? undefined,
      content: row.content ?? undefined,
      raw: row.rawJson ? JSON.parse(row.rawJson) : null,
    };

    const analysis = await analyzeItem({ item, companyOrEvent });

    getDb().prepare(`
      INSERT INTO analyses (itemId, summary, entitiesJson, sentiment, impact, predictionsJson, updatedAt)
      VALUES (@itemId, @summary, @entitiesJson, @sentiment, @impact, @predictionsJson, @updatedAt)
      ON CONFLICT(itemId) DO UPDATE SET
        summary=excluded.summary,
        entitiesJson=excluded.entitiesJson,
        sentiment=excluded.sentiment,
        impact=excluded.impact,
        predictionsJson=excluded.predictionsJson,
        updatedAt=excluded.updatedAt
    `).run({
      itemId: item.id,
      summary: analysis.summary,
      entitiesJson: JSON.stringify(analysis.entities),
      sentiment: analysis.sentiment,
      impact: analysis.impact,
      predictionsJson: JSON.stringify(analysis.predictions),
      updatedAt: Date.now(),
    });
  }

  return { ingested: all.length, analyzed: Math.min(recent.length, 15) };
}

export const db = () => getDb();
