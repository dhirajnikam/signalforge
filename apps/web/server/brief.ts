import { getDb } from './refresh';

export type BriefItem = {
  title: string | null;
  url: string | null;
  source: string;
  ts: number;
  summary: string | null;
  impact: string | null;
  predictions: Array<{ scenario: string; horizonHours: number; probability: number; confidence: 'low' | 'medium' | 'high' }>;
};

export type Brief = {
  generatedAt: number;
  focus: string | null;
  items: BriefItem[];
};

export async function getBrief(params: { companyOrEvent?: string }): Promise<Brief> { 
  const rows = getDb()
    .prepare(
      `SELECT i.title, i.url, i.source, COALESCE(i.publishedAt, i.createdAt) as ts,
              a.summary, a.impact, a.predictionsJson
       FROM items i
       LEFT JOIN analyses a ON a.itemId = i.id
       ORDER BY ts DESC
       LIMIT 12`
    )
    .all();

  const filtered = params.companyOrEvent
    ? rows.filter((r: any) =>
        String(r.title ?? '').toLowerCase().includes(params.companyOrEvent!.toLowerCase()) ||
        String(r.summary ?? '').toLowerCase().includes(params.companyOrEvent!.toLowerCase())
      )
    : rows;

  return {
    generatedAt: Date.now(),
    focus: params.companyOrEvent ?? null,
    items: filtered.map((r: any) =>
      ({
        title: r.title ?? null,
        url: r.url ?? null,
        source: String(r.source ?? ''),
        ts: Number(r.ts),
        summary: r.summary ?? null,
        impact: r.impact ?? null,
        predictions: r.predictionsJson ? JSON.parse(r.predictionsJson) : [],
      }) satisfies BriefItem
    ),
  };
}
