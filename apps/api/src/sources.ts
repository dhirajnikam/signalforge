import Parser from 'rss-parser';
import { ingestTwitter } from './sources.twitter.js';

export type Source =
  | { kind: 'rss'; name: string; url: string }
  | { kind: 'web'; name: string; url: string }
  | { kind: 'twitter'; name: string; handle: string; provider?: 'rsshub' | 'nitter' | 'auto' };

export type IngestedItem = {
  id: string;
  source: string;
  kind: string;
  title?: string;
  url?: string;
  publishedAt?: number; // epoch ms
  content?: string;
  raw: unknown;
};

const rssParser = new Parser();

export async function ingestSource(source: Source, opts?: { rsshubBaseUrl?: string; nitterBaseUrl?: string }): Promise<IngestedItem[]> {
  if (source.kind === 'rss') return ingestRss(source);
  if (source.kind === 'web') return ingestWeb(source);
  if (source.kind === 'twitter') return ingestTwitter(source, opts);
  return [];
}

async function ingestRss(source: Extract<Source, { kind: 'rss' }>): Promise<IngestedItem[]> {
  const feed = await rssParser.parseURL(source.url);
  const items = (feed.items ?? []).map((it) => {
    const url = (it.link ?? undefined) as string | undefined;
    const pub = it.isoDate ? Date.parse(it.isoDate) : it.pubDate ? Date.parse(it.pubDate) : undefined;
    const id = url ?? `${source.name}:${it.guid ?? it.title ?? Math.random().toString(36).slice(2)}`;
    const content = (it.contentSnippet ?? it.content ?? it['content:encoded'] ?? undefined) as string | undefined;
    return {
      id,
      source: source.name,
      kind: 'rss',
      title: it.title ?? undefined,
      url,
      publishedAt: Number.isFinite(pub) ? pub : undefined,
      content,
      raw: it,
    } satisfies IngestedItem;
  });
  return items;
}

async function ingestWeb(source: Extract<Source, { kind: 'web' }>): Promise<IngestedItem[]> {
  // Minimal: treat a web URL as a single "page" item.
  const res = await fetch(source.url, { headers: { 'user-agent': 'signalforge/0.1 (+https://github.com/dhirajnikam)' } });
  const html = await res.text();
  const id = source.url;
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 6000);

  return [
    {
      id,
      source: source.name,
      kind: 'web',
      title,
      url: source.url,
      publishedAt: Date.now(),
      content: text,
      raw: { url: source.url, status: res.status },
    },
  ];
}
