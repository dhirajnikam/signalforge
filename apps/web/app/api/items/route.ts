import { z } from 'zod';
import { getDb } from '../../../server/refresh';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = z
    .object({
      q: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(200).default(50),
    })
    .parse({ q: searchParams.get('q') ?? undefined, limit: searchParams.get('limit') ?? undefined });

  const rows = getDb()
    .prepare(
      `SELECT i.*, a.summary, a.entitiesJson, a.sentiment, a.impact, a.predictionsJson, a.updatedAt
       FROM items i
       LEFT JOIN analyses a ON a.itemId = i.id
       WHERE (@q IS NULL OR i.title LIKE '%'||@q||'%' OR i.content LIKE '%'||@q||'%')
       ORDER BY COALESCE(i.publishedAt, i.createdAt) DESC
       LIMIT @limit`
    )
    .all({ q: q.q ?? null, limit: q.limit });

  return Response.json(
    rows.map((r: any) => ({
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
    }))
  );
}
