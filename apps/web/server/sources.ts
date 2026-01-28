import Parser from 'rss-parser';

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
  publishedAt?: number;
  content?: string;
  raw: unknown;
};

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
  rsshubBaseUrl: string;
  nitterBaseUrl: string;
}): string[] {
  const handle = normalizeHandle(params.handle);
  const rsshub = joinUrl(params.rsshubBaseUrl, `/twitter/user/${encodeURIComponent(handle)}`);
  const nitter = joinUrl(params.nitterBaseUrl, `/${encodeURIComponent(handle)}/rss`);

  if (params.provider === 'rsshub') return [rsshub];
  if (params.provider === 'nitter') return [nitter];
  return [rsshub, nitter];
}

export async function ingestSource(
  source: Source,
  opts: { rsshubBaseUrl: string; nitterBaseUrl: string }
): Promise<IngestedItem[]> {
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
    const content = (it.contentSnippet ?? it.content ?? (it as any)['content:encoded'] ?? undefined) as string | undefined;
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

async function ingestTwitter(
  source: Extract<Source, { kind: 'twitter' }>,
  opts: { rsshubBaseUrl: string; nitterBaseUrl: string }
): Promise<IngestedItem[]> {
  const provider = source.provider ?? 'auto';
  const candidates = twitterToFeedUrls({
    handle: source.handle,
    provider,
    rsshubBaseUrl: opts.rsshubBaseUrl,
    nitterBaseUrl: opts.nitterBaseUrl,
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

async function ingestWeb(source: Extract<Source, { kind: 'web' }>): Promise<IngestedItem[]> {
  const res = await fetch(source.url, { headers: { 'user-agent': 'signalforge/0.2 (+https://github.com/dhirajnikam/signalforge)' } });
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
