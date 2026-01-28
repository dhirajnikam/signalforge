import Parser from 'rss-parser';
import type { Source, IngestedItem } from './sources.js';

const rssParser = new Parser();

function normalizeHandle(handle: string) {
  return handle.replace(/^@/, '').trim();
}

function joinUrl(base: string, path: string) {
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}

function twitterToFeedUrls(params: {
  handle: string;
  provider: NonNullable<Extract<Source, { kind: 'twitter' }>['provider']>;
  rsshubBaseUrl?: string;
  nitterBaseUrl?: string;
}): string[] {
  const handle = normalizeHandle(params.handle);
  const provider = params.provider;
  const rsshubBaseUrl = params.rsshubBaseUrl ?? 'https://rsshub.app';
  const nitterBaseUrl = params.nitterBaseUrl ?? 'https://nitter.net';

  const rsshub = joinUrl(rsshubBaseUrl, `/twitter/user/${encodeURIComponent(handle)}`);
  const nitter = joinUrl(nitterBaseUrl, `/${encodeURIComponent(handle)}/rss`);

  if (provider === 'rsshub') return [rsshub];
  if (provider === 'nitter') return [nitter];
  return [rsshub, nitter];
}

export async function ingestTwitter(
  source: Extract<Source, { kind: 'twitter' }>,
  opts?: { rsshubBaseUrl?: string; nitterBaseUrl?: string }
): Promise<IngestedItem[]> {
  const provider = source.provider ?? 'auto';
  const candidates = twitterToFeedUrls({
    handle: source.handle,
    provider,
    rsshubBaseUrl: opts?.rsshubBaseUrl,
    nitterBaseUrl: opts?.nitterBaseUrl,
  });

  let lastErr: unknown;
  for (const url of candidates) {
    try {
      const feed = await rssParser.parseURL(url);
      const items = (feed.items ?? []).map((it) => {
        const link = (it.link ?? undefined) as string | undefined;
        const pub = it.isoDate ? Date.parse(it.isoDate) : it.pubDate ? Date.parse(it.pubDate) : undefined;
        const id = link ?? `${source.name}:${it.guid ?? it.title ?? Math.random().toString(36).slice(2)}`;
        const content = (it.contentSnippet ?? it.content ?? (it as any)['content:encoded'] ?? undefined) as string | undefined;
        return {
          id,
          source: source.name,
          kind: 'twitter',
          title: it.title ?? undefined,
          url: link,
          publishedAt: Number.isFinite(pub) ? pub : undefined,
          content,
          raw: it,
        } satisfies IngestedItem;
      });
      return items;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('No twitter feed candidate succeeded');
}
