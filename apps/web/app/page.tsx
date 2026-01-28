import { getBrief } from '../server/brief';
import RefreshButton from './refresh-button';

export default async function Page() {
  const brief = await getBrief({});
  const generatedAt = new Date(brief.generatedAt).toISOString();

  return (
    <main>
      <header className="header">
        <div className="hgroup">
          <h1 className="title">SignalForge</h1>
          <p className="subtitle">
            A compact intel stream: RSS + Twitter/X via RSS bridges, stored in SQLite, optionally summarized with an LLM (auto-detected from
            environment).
          </p>
          <div className="kpi">
            <span>
              Generated: <code>{generatedAt}</code>
            </span>
            <span>
              Focus: <code>{brief.focus ?? 'none'}</code>
            </span>
          </div>
        </div>
        <div className="toolbar">
          <RefreshButton />
          <a className="btn" href="/api/health" target="_blank" rel="noreferrer">
            API health
          </a>
        </div>
      </header>

      <section className="grid">
        <div className="card panel">
          <h2 style={{ margin: 0, fontSize: 16 }}>Latest brief</h2>
          <div className="list">
            {brief.items.map((it) => (
              <div key={(it.url ?? it.title) as string} className="item">
                <div className="itemTop">
                  <div>
                    <h3>
                      {it.url ? (
                        <a className="link" href={it.url} target="_blank" rel="noreferrer">
                          {it.title ?? it.url}
                        </a>
                      ) : (
                        it.title
                      )}
                    </h3>
                    <div className="meta">
                      <span className="badge">{it.source}</span>
                      <span>{new Date(it.ts).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                {it.summary ? <p className="summary">{it.summary}</p> : <p className="small">No summary yet (refresh to analyze).</p>}
                {it.impact ? <p className="small">Impact: {it.impact}</p> : null}
              </div>
            ))}
          </div>
        </div>

        <aside className="card panel">
          <h2 style={{ margin: 0, fontSize: 16 }}>How it works</h2>
          <p className="small">
            Configure sources with <code>SOURCES_JSON</code>. For Twitter/X, use kind <code>twitter</code> which resolves to RSSHub (default) or
            Nitter RSS.
          </p>
          <pre
            style={{
              marginTop: 12,
              background: 'rgba(0,0,0,.25)',
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 14,
              padding: 12,
              overflowX: 'auto',
              color: 'rgba(234,240,255,.9)',
              fontSize: 12,
              lineHeight: 1.4,
            }}
          >{`[
  {"kind":"rss","name":"Techmeme","url":"https://www.techmeme.com/feed.xml"},
  {"kind":"twitter","name":"OpenAI","handle":"openai","provider":"auto"}
]`}</pre>
          <p className="small" style={{ marginTop: 12 }}>
            If <code>OPENAI_API_KEY</code> is present in the server environment, SignalForge will generate structured summaries and predictions.
            Otherwise it runs in no-LLM mode.
          </p>
        </aside>
      </section>
    </main>
  );
}
