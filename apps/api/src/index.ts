import 'dotenv/config';
import Fastify from 'fastify';
import cron from 'node-cron';
import { z } from 'zod';
import { openDb } from './db.js';
import { ingestSource, type Source, type IngestedItem } from './sources.js';
import { analyzeItem } from './analyze.js';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(8787),
  SQLITE_PATH: z.string().default('./data/signalforge.sqlite'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  REFRESH_CRON: z.string().default('*/30 * * * *'),
  SOURCES_JSON: z.string().default('[]'),
});

const env = EnvSchema.parse(process.env);
const db = openDb(env.SQLITE_PATH);

function upsertItem(item: IngestedItem) {
  const stmt = db.prepare(`
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

async function runRefresh(companyOrEvent?: string) {
  const sources = parseSources(env.SOURCES_JSON);
  const all: IngestedItem[] = [];
  for (const s of sources) {
    try {
      const items = await ingestSource(s);
      for (const it of items) {
        upsertItem(it);
        all.push(it);
      }
    } catch (e) {
      // ignore per-source failures
      console.error('source failed', s.name, e);
    }
  }

  // Analyze the most recent N items
  const recent = db
    .prepare('SELECT id, source, kind, title, url, publishedAt, content, rawJson, createdAt FROM items ORDER BY COALESCE(publishedAt, createdAt) DESC LIMIT 15')
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

    const analysis = await analyzeItem({
      item,
      openaiApiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL,
      companyOrEvent,
    });

    db.prepare(`
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

function parseSources(json: string): Source[] {
  try {
    const parsed = JSON.parse(json);
    const arr = z
      .array(
        z.discriminatedUnion('kind', [
          z.object({ kind: z.literal('rss'), name: z.string(), url: z.string().url() }),
          z.object({ kind: z.literal('web'), name: z.string(), url: z.string().url() }),
        ])
      )
      .parse(parsed);
    return arr;
  } catch {
    return [];
  }
}

async function main() {
  const app = Fastify({ logger: true });

  app.get('/health', async () => ({ ok: true }));

  app.get('/items', async (req) => {
    const q = z
      .object({
        q: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(200).default(50),
      })
      .parse(req.query);

    const rows = db
      .prepare(
        `SELECT i.*, a.summary, a.entitiesJson, a.sentiment, a.impact, a.predictionsJson, a.updatedAt
         FROM items i
         LEFT JOIN analyses a ON a.itemId = i.id
         WHERE (@q IS NULL OR i.title LIKE '%'||@q||'%' OR i.content LIKE '%'||@q||'%')
         ORDER BY COALESCE(i.publishedAt, i.createdAt) DESC
         LIMIT @limit`
      )
      .all({ q: q.q ?? null, limit: q.limit });

    return rows.map((r: any) => ({
      id: r.id,
      source: r.source,
      kind: r.kind,
      title: r.title,
      url: r.url,
      publishedAt: r.publishedAt,
      content: r.content,
      analysis: r.summary
        ? {
            summary: r.summary,
            entities: r.entitiesJson ? JSON.parse(r.entitiesJson) : [],
            sentiment: r.sentiment,
            impact: r.impact,
            predictions: r.predictionsJson ? JSON.parse(r.predictionsJson) : [],
            updatedAt: r.updatedAt,
          }
        : null,
    }));
  });

  app.post('/refresh', async (req) => {
    const body = z.object({ companyOrEvent: z.string().optional() }).parse(req.body ?? {});
    return runRefresh(body.companyOrEvent);
  });

  app.get('/brief', async (req) => {
    const q = z.object({ companyOrEvent: z.string().optional() }).parse(req.query);
    const rows = db
      .prepare(
        `SELECT i.title, i.url, i.source, COALESCE(i.publishedAt, i.createdAt) as ts,
                a.summary, a.impact, a.predictionsJson
         FROM items i
         LEFT JOIN analyses a ON a.itemId = i.id
         ORDER BY ts DESC
         LIMIT 12`
      )
      .all();

    // If companyOrEvent provided, do a quick filter.
    const filtered = q.companyOrEvent
      ? rows.filter((r: any) =>
          String(r.title ?? '').toLowerCase().includes(q.companyOrEvent!.toLowerCase()) ||
          String(r.summary ?? '').toLowerCase().includes(q.companyOrEvent!.toLowerCase())
        )
      : rows;

    return {
      generatedAt: Date.now(),
      focus: q.companyOrEvent ?? null,
      items: filtered.map((r: any) => ({
        title: r.title,
        url: r.url,
        source: r.source,
        ts: r.ts,
        summary: r.summary ?? null,
        impact: r.impact ?? null,
        predictions: r.predictionsJson ? JSON.parse(r.predictionsJson) : [],
      })),
    };
  });

  // scheduler
  cron.schedule(env.REFRESH_CRON, async () => {
    try {
      await runRefresh();
    } catch (e) {
      app.log.error(e);
    }
  });

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
