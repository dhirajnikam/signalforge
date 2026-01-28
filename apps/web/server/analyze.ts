import OpenAI from 'openai';
import { z } from 'zod';
import type { IngestedItem } from './sources';
import { env } from './env';

const AnalysisSchema = z.object({
  summary: z.string(),
  entities: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['company', 'person', 'org', 'place', 'ticker', 'event', 'other']).default('other'),
      relevance: z.number().min(0).max(1).default(0.5),
    })
  ),
  sentiment: z.number().min(-1).max(1),
  impact: z.string(),
  predictions: z.array(
    z.object({
      scenario: z.string(),
      horizonHours: z.number().int().min(1).max(168),
      probability: z.number().min(0).max(1),
      confidence: z.enum(['low', 'medium', 'high']),
    })
  ),
});

export type Analysis = z.infer<typeof AnalysisSchema>;

export async function analyzeItem(params: { item: IngestedItem; companyOrEvent?: string }): Promise<Analysis> {
  const { item, companyOrEvent } = params;

  const apiKey = env.OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;
  const baseURL = env.OPENAI_BASE_URL ?? process.env.OPENAI_BASE_URL;

  if (!apiKey) {
    return {
      summary: (item.title ?? 'Update') + (item.url ? ` (${item.url})` : ''),
      entities: [],
      sentiment: 0,
      impact: 'No LLM detected in environment; running in no-LLM mode.',
      predictions: [],
    };
  }

  const client = new OpenAI({ apiKey, baseURL });
  const focus = companyOrEvent ? `\nFocus requested: ${companyOrEvent}` : '';

  const prompt = `You are SignalForge, a high-signal analyst.

Input item:
- source: ${item.source}
- title: ${item.title ?? ''}
- url: ${item.url ?? ''}
- publishedAt: ${item.publishedAt ? new Date(item.publishedAt).toISOString() : ''}
- content: ${item.content ?? ''}
${focus}

Return STRICT JSON matching this schema:
{
  "summary": string,
  "entities": [{"name": string, "type": "company"|"person"|"org"|"place"|"ticker"|"event"|"other", "relevance": number 0..1}],
  "sentiment": number -1..1,
  "impact": string,
  "predictions": [{"scenario": string, "horizonHours": number, "probability": number 0..1, "confidence": "low"|"medium"|"high"}]
}

Rules:
- Be concise but insightful.
- If uncertain, reduce probability and confidence.
- Prefer 2-4 predictions max.
`;

  const resp = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'You output only valid JSON.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  });

  const text = resp.choices[0]?.message?.content ?? '{}';
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    parsed = m ? JSON.parse(m[0]) : {};
  }

  return AnalysisSchema.parse(parsed);
}
